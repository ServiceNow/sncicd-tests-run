"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const axios_1 = __importDefault(require("axios"));
const App_types_1 = require("./App.types");
class App {
    constructor(props) {
        this.sleepTime = 3000;
        this.errCodeMessages = {
            401: 'The user credentials are incorrect.',
            403: 'Forbidden. The user is not an admin or does not have the CICD role.',
            404: 'Not found. The requested item was not found.',
            405: 'Invalid method. The functionality is disabled.',
            409: 'Conflict. The requested item is not unique.',
            500: 'Internal server error. An unexpected error occurred while processing the request.',
        };
        this.messages = {
            error: 'Error message.',
            rolledup_test_error_count: 'Number of tests with errors',
            rolledup_test_failure_count: 'Number of tests that failed',
            rolledup_test_skip_count: 'Number of tests that were skipped',
            rolledup_test_success_count: 'Number of tests that ran successfully',
            status_detail: 'Additional information about the current state',
            status_message: 'Description of the current state',
            test_suite_duration: 'Amount of time that it took to execute the test suite',
            test_suite_name: 'Name of the test suite',
        };
        this.props = props;
        this.user = {
            username: props.username,
            password: props.password,
        };
        this.config = {
            headers: {
                'User-Agent': 'sncicd_extint_github',
                Accept: 'application/json',
            },
            auth: this.user,
        };
    }
    buildParams(options) {
        return (Object.keys(options)
            // @ts-ignore
            .filter(key => options.hasOwnProperty(key) && options[key])
            // @ts-ignore
            .map(key => `${key}=${encodeURIComponent(options[key])}`)
            .join('&'));
    }
    /**
     * @param options
     *
     * @returns string  Url to API
     */
    buildRequestUrl(options) {
        if (!this.props.nowInstallInstance)
            throw new Error(App_types_1.Errors.INCORRECT_CONFIG);
        const params = this.buildParams(options);
        return `https://${this.props.nowInstallInstance}.service-now.com/api/sn_cicd/testsuite/run?${params}`;
    }
    /**
     * Get plugin id
     * Makes the request to ServiceNow api plugin/{plugin_id}/rollback
     * Prints the progress
     * @returns         Promise void
     */
    async runTests() {
        try {
            const inputs = this.getInputVariables();
            const url = this.buildRequestUrl(inputs);
            const response = await axios_1.default.post(url, {}, this.config);
            await this.printStatus(response.data.result);
        }
        catch (error) {
            let message;
            if (error.response && error.response.status) {
                if (this.errCodeMessages[error.response.status]) {
                    message = this.errCodeMessages[error.response.status];
                }
                else {
                    const result = error.response.data.result;
                    message = result.error || result.status_message;
                }
            }
            else {
                message = error.message;
            }
            throw new Error(message);
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
    sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
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
    async printStatus(result) {
        if (+result.status === App_types_1.ResponseStatus.Pending)
            core.info(result.status_label);
        if (+result.status === App_types_1.ResponseStatus.Running || +result.status === App_types_1.ResponseStatus.Successful)
            core.info(`${result.status_label}: ${result.percent_complete}%`);
        // Recursion to check the status of the request
        if (+result.status < App_types_1.ResponseStatus.Successful) {
            const response = await axios_1.default.get(result.links.progress.url, this.config);
            // Throttling
            await this.sleep(this.sleepTime);
            // Call itself if the request in the running or pending state
            await this.printStatus(response.data.result);
        }
        else {
            // Log the success result, the step of the pipeline is success as well
            if (+result.status === App_types_1.ResponseStatus.Successful) {
                core.info(this.makeGreenString(result.status_detail));
                core.info(this.makeGreenString(result.status_message));
            }
            if (result.links.results) {
                await this.getTestResults(result.links.results.url);
            }
            // Log the failed result, the step throw an error to fail the step
            if (+result.status === App_types_1.ResponseStatus.Failed) {
                throw new Error(result.error || result.status_message);
            }
            // Log the canceled result, the step throw an error to fail the step
            if (+result.status === App_types_1.ResponseStatus.Canceled) {
                this.makeRedString(result.error || result.status_message);
                this.makeRedString(result.status_detail);
                throw new Error(App_types_1.Errors.CANCELLED);
            }
        }
    }
    async getTestResults(url) {
        const { data: { result }, } = await axios_1.default.get(url, this.config);
        if (+result.status === App_types_1.ResponseStatus.Successful) {
            core.info(this.makeGreenString('success'));
            core.info('Link to results is: ' + result.links.results.url);
            core.info(Object.keys(this.messages)
                // @ts-ignore
                .filter(name => result[name])
                // @ts-ignore
                .map(name => `${this.messages[name]}: ${result[name]}`)
                .join('\n'));
        }
        else {
            core.info(this.makeRedString(App_types_1.Errors.TESTS_FAILED));
            throw new Error(App_types_1.Errors.TEST_SUITE_FAILED);
        }
    }
    makeGreenString(message) {
        return `\x1b[32m${message}\x1b[0m\n`;
    }
    makeRedString(message) {
        return `'\x1b[31m${message}\x1b[0m\\n'`;
    }
    /**
     * Gets the id of the plugin.
     * pluginID can be set in the workflow file
     * and read in the action.yml file from the input variable
     */
    getInputVariables() {
        const browser_name = core.getInput('browserName');
        const browser_version = core.getInput('browserVersion');
        const os_name = core.getInput('osName');
        const os_version = core.getInput('osVersion');
        const test_suite_sys_id = core.getInput('testSuiteSysId');
        const test_suite_name = core.getInput('testSuiteName');
        if (!test_suite_sys_id && !test_suite_name)
            throw new Error(App_types_1.Errors.SUITE_SYS_ID_OR_NAME);
        const options = {
            test_suite_sys_id,
            test_suite_name,
            browser_name,
            browser_version,
            os_name,
            os_version,
        };
        if (test_suite_sys_id && test_suite_name) {
            delete options.test_suite_name;
        }
        return options;
    }
}
exports.default = App;
