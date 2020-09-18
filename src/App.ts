import * as core from '@actions/core'
import axios from 'axios'

import {
    RequestResult,
    AppProps,
    axiosConfig,
    Errors,
    RequestResponse,
    ResponseStatus,
    User,
    ErrorResult,
    RequestOptions,
} from './App.types'

export default class App {
    sleepTime = 3000
    user: User
    config: axiosConfig
    props: AppProps
    errCodeMessages: any = {
        401: 'The user credentials are incorrect.',
        403: 'Forbidden. The user is not an admin or does not have the CICD role.',
        404: 'Not found. The requested item was not found.',
        405: 'Invalid method. The functionality is disabled.',
        409: 'Conflict. The requested item is not unique.',
        500: 'Internal server error. An unexpected error occurred while processing the request.',
    }
    messages = {
        error: 'Error message.',
        rolledup_test_error_count: 'Number of tests with errors',
        rolledup_test_failure_count: 'Number of tests that failed',
        rolledup_test_skip_count: 'Number of tests that were skipped',
        rolledup_test_success_count: 'Number of tests that ran successfully',
        status_detail: 'Additional information about the current state',
        status_message: 'Description of the current state',
        test_suite_duration: 'Amount of time that it took to execute the test suite',
        test_suite_name: 'Name of the test suite'
    };

    constructor(props: AppProps) {
        this.props = props
        this.user = {
            username: props.username,
            password: props.password,
        }
        this.config = {
            headers: {Accept: 'application/json'},
            auth: this.user,
        }
    }

    buildParams(options: RequestOptions): string {
        return (
            Object.keys(options)
                // @ts-ignore
                .filter(key => options.hasOwnProperty(key) && options[key])
                // @ts-ignore
                .map(key => `${key}=${encodeURIComponent(options[key])}`)
                .join('&')
        )
    }

    /**
     * @param options
     *
     * @returns string  Url to API
     */
    buildRequestUrl(options: RequestOptions): string {
        if (!this.props.snowInstallInstance) throw new Error(Errors.INCORRECT_CONFIG)

        const params: string = this.buildParams(options)
        return `https://${this.props.snowInstallInstance}.service-now.com/api/sn_cicd/testsuite/run?${params}`
    }

    /**
     * Get plugin id
     * Makes the request to SNow api plugin/{plugin_id}/rollback
     * Prints the progress
     * @returns         Promise void
     */
    async runTests(): Promise<void | never> {
        try {
            const inputs: RequestOptions = this.getInputVariables()

            const url: string = this.buildRequestUrl(inputs)
            const response: RequestResponse = await axios.post(url, {}, this.config)
            await this.printStatus(response.data.result)

        } catch (error) {
            let message: string
            if (error.response && error.response.status) {
                if (this.errCodeMessages[error.response.status]) {
                    message = this.errCodeMessages[error.response.status]
                } else {
                    const result: ErrorResult = error.response.data.result
                    message = result.error || result.status_message
                }
            } else {
                message = error.message
            }
            throw new Error(message)
        }
    }

    /**
     * Some kind of throttling, it used to limit the number of requests
     * in the recursion
     *
     * @param ms    Number of milliseconds to wait
     *
     * @returns     Promise void
     */
    sleep(ms: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }

    /**
     * Print the result of the task.
     * Execution will continue.
     * Task will be working until it get the response with successful or failed or canceled status.
     * Set output rollBack_version variable
     *
     * @param result    TaskResult enum of Succeeded, SucceededWithIssues, Failed, Cancelled or Skipped.
     *
     * @returns         void
     */
    async printStatus(result: RequestResult): Promise<void> {
        if (+result.status === ResponseStatus.Pending) console.log(result.status_label)

        if (+result.status === ResponseStatus.Running || +result.status === ResponseStatus.Successful)
            console.log(`${result.status_label}: ${result.percent_complete}%`)

        // Recursion to check the status of the request
        if (+result.status < ResponseStatus.Successful) {
            const response: RequestResponse = await axios.get(result.links.progress.url, this.config)
            // Throttling
            await this.sleep(this.sleepTime)
            // Call itself if the request in the running or pending state
            await this.printStatus(response.data.result)
        } else {
            // Log the success result, the step of the pipeline is success as well
            if (+result.status === ResponseStatus.Successful) {
                this.makeGreenString(result.status_detail)
                this.makeGreenString(result.status_message)
            }

            if (result.links.results) {
                await this.getTestResults(result.links.results.url)
            }

            // Log the failed result, the step throw an error to fail the step
            if (+result.status === ResponseStatus.Failed) {
                throw new Error(result.error || result.status_message)
            }

            // Log the canceled result, the step throw an error to fail the step
            if (+result.status === ResponseStatus.Canceled) {
                this.makeRedString(result.error || result.status_message)
                this.makeRedString(result.status_detail)
                throw new Error(Errors.CANCELLED)
            }
        }
    }

    async getTestResults(url: string): Promise<void> {
        const {data: {result}}: RequestResponse = await axios.get(url, this.config)
        if (+result.status === ResponseStatus.Successful) {
            console.log(this.makeGreenString("success"));
            console.log('Link to results is: ' + result.links.results.url);
            console.log(Object.keys(this.messages)
                // @ts-ignore
                .filter(name => result[name])
                // @ts-ignore
                .map(name => `${this.messages[name]}: ${result[name]}`)
                .join('\n')
            );
        } else {
            console.log(this.makeRedString(Errors.TESTS_FAILED));
            throw new Error(Errors.TEST_SUITE_FAILED);
        }
    }

    makeGreenString(message: string): string {
        return `\x1b[32m${message}\x1b[0m\n`
    }

    makeRedString(message: string): string {
        return `'\x1b[31m${message}\x1b[0m\\n'`
    }

    /**
     * Gets the id of the plugin.
     * pluginID can be set in the workflow file
     * and read in the action.yml file from the input variable
     */
    getInputVariables(): RequestOptions {
        const browser_name: string | undefined = core.getInput('browserName')
        const browser_version: string | undefined = core.getInput('browserVersion')
        const os_name: string | undefined = core.getInput('osName')
        const os_version: string | undefined = core.getInput('osVersion')
        const test_suite_sys_id: string | undefined = core.getInput('testSuiteSysId')
        const test_suite_name: string | undefined = core.getInput('testSuiteName')

        if (!test_suite_sys_id && !test_suite_name) throw new Error(Errors.SUITE_SYS_ID_OR_NAME)

        const options: RequestOptions = {
            test_suite_sys_id,
            test_suite_name,
            browser_name,
            browser_version,
            os_name,
            os_version,
        }

        if (test_suite_sys_id && test_suite_name) {
            delete options.test_suite_name
        }

        return options
    }
}
