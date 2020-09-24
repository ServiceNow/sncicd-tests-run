import * as core from '@actions/core'
import axios from 'axios'
import App from '../App'
import {
    AppProps,
    axiosConfig,
    Errors,
    RequestOptions,
    RequestResponse /* axiosConfig, Errors, RequestResponse*/,
} from '../App.types'

const getFullUrl = (props: AppProps, inputs: any) =>
    `https://${props.snowInstallInstance}.service-now.com/api/sn_cicd/testsuite/run?test_suite_sys_id=${inputs.test_suite_sys_id}&test_suite_name=${inputs.test_suite_name}&browser_name=${inputs.browser_name}&browser_version=${inputs.browser_version}&os_name=${inputs.os_name}&os_version=${inputs.os_version}`

describe(`App lib`, () => {
    let props: AppProps

    let inputs: any = {
        testSuiteSysId: 'testSuiteSysId',
        testSuiteName: 'testSuiteName',
        browserName: 'browserName',
        browserVersion: 'browserVersion',
        osName: 'osName',
        osVersion: 'osVersion',
    }
    let validInputs: RequestOptions = {}

    beforeAll(() => {
        jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
            return inputs[name]
        })

        validInputs = {
            test_suite_sys_id: inputs.testSuiteSysId,
            test_suite_name: inputs.testSuiteName,
            browser_name: inputs.browserName,
            browser_version: inputs.browserVersion,
            os_name: inputs.osName,
            os_version: inputs.osVersion,
        }

        // Mock error/warning/info/debug
        jest.spyOn(core, 'error').mockImplementation(jest.fn())
        jest.spyOn(core, 'warning').mockImplementation(jest.fn())
        jest.spyOn(core, 'info').mockImplementation(jest.fn())
        jest.spyOn(core, 'debug').mockImplementation(jest.fn())
    })

    beforeEach(() => {
        props = { password: 'test', snowInstallInstance: 'test', username: 'test' }
    })
    describe(`builds request url`, () => {
        it(`with correct params`, () => {
            const app = new App(props)

            expect(app.buildRequestUrl(validInputs)).toEqual(getFullUrl(props, validInputs))
        })
        it(`without instance parameter`, () => {
            props.snowInstallInstance = ''
            const app = new App(props)

            expect(() => app.buildRequestUrl(validInputs)).toThrow(Errors.INCORRECT_CONFIG)
        })
    })

    describe(`Run Tests`, () => {
        const post = jest.spyOn(axios, 'post')
        const response: RequestResponse = {
            data: {
                result: {
                    links: {
                        progress: {
                            id: 'id',
                            url: 'http://test.xyz',
                        },
                        results: {
                            id: 'test',
                            url: 'http://test.xyz',
                        },
                    },
                    status: '2',
                    status_label: 'success',
                    status_message: 'label',
                    status_detail: 'detail',
                    error: '',
                    percent_complete: 100,
                    test_suite_status: '',
                    test_suite_duration: '',
                    rolledup_test_success_count: 1,
                    rolledup_test_failure_count: 1,
                    rolledup_test_error_count: 1,
                    rolledup_test_skip_count: 1,
                    child_suite_results: [],
                },
            },
        }
        post.mockResolvedValue(response)
        jest.spyOn(global.console, 'log')
        it(`with params`, async () => {
            const app = new App(props)
            try {
                await app.runTests()
                const config: axiosConfig = {
                    auth: {
                        username: props.username,
                        password: props.password,
                    },
                    headers: {
                        'User-Agent': 'sncicd_extint_github',
                        Accept: 'application/json',
                    },
                }

                expect(post).toHaveBeenCalledWith(getFullUrl(props, validInputs), {}, config)
            } catch (e) {
                expect(e).not.toEqual(new Error(Errors.SUITE_SYS_ID_OR_NAME))
            }
        })
        it(`without params`, async () => {
            const app = new App(props)
            inputs = {}
            try {
                await app.runTests()
                const config: axiosConfig = {
                    auth: {
                        username: props.username,
                        password: props.password,
                    },
                    headers: {
                        'User-Agent': 'sncicd_extint_github',
                        Accept: 'application/json',
                    },
                }

                expect(post).not.toHaveBeenCalledWith(getFullUrl(props, inputs), {}, config)
            } catch (e) {
                expect(e).toEqual(new Error(Errors.SUITE_SYS_ID_OR_NAME))
            }
        })
    })

    it(`getTestResults`, async () => {
        const get = jest.spyOn(axios, 'get')
        const response: RequestResponse = {
            data: {
                result: {
                    links: {
                        progress: {
                            id: 'id',
                            url: 'http://test.xyz',
                        },
                        results: {
                            id: 'test',
                            url: 'http://link-to-results.xyz',
                        },
                    },
                    status: '2',
                    status_label: 'success',
                    status_message: 'label',
                    status_detail: 'detail',
                    error: '',
                    percent_complete: 100,
                    test_suite_status: '2',
                    test_suite_duration: '3',
                    rolledup_test_success_count: 5,
                    rolledup_test_failure_count: 0,
                    rolledup_test_error_count: 2,
                    rolledup_test_skip_count: 3,
                    child_suite_results: [],
                },
            },
        }
        get.mockResolvedValue(response)
        const log = jest.spyOn(core, 'info')

        const app = new App(props)

        await app.getTestResults('http://test.xyz')
        expect(log).toHaveBeenCalledWith(app.makeGreenString('success'))
        expect(log).toHaveBeenCalledWith(
            `Number of tests with errors: 2\nNumber of tests that were skipped: 3\nNumber of tests that ran successfully: 5\nAdditional information about the current state: detail\nDescription of the current state: label\nAmount of time that it took to execute the test suite: 3`,
        )
    })
})
