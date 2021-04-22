export interface User {
    username: string;
    password: string;
}

export interface AppProps extends User {
    nowInstallInstance: string;
}

export interface ErrorResult {
    status: string;
    status_label: string;
    status_message: string;
    status_detail: string;
    error: string;
}

export enum Errors {
    USERNAME = 'nowUsername is not set',
    PASSWORD = 'nowPassword is not set',
    INSTALL_INSTANCE = 'nowInstallInstance is not set',
    SUITE_SYS_ID_OR_NAME = 'Set testSuiteSysId or testSuiteName please',
    INCORRECT_CONFIG = 'Configuration is incorrect',
    CANCELLED = 'Canceled',
    TESTS_FAILED = 'Testsuite run failed',
    TEST_SUITE_FAILED = 'Testsuite failed',
}

export interface RequestOptions {
    test_suite_sys_id?: string | undefined;
    test_suite_name?: string | undefined;
    browser_name?: string | undefined;
    browser_version?: string | undefined;
    os_name?: string | undefined;
    os_version?: string | undefined;
}

export interface RequestResponse {
    data: {
        result: RequestResult,
    };
}

export interface TestsResult {
    test_suite_status: string;
    test_suite_duration: string;
    rolledup_test_success_count: number;
    rolledup_test_failure_count: number;
    rolledup_test_error_count: number;
    rolledup_test_skip_count: number;
    child_suite_results: TestsResult[];
}

export interface RequestResult extends TestsResult {
    links: {
        progress: {
            id: string,
            url: string,
        },
        results: {
            id: string,
            url: string,
        },
    };
    status: string;
    status_label: string;
    status_message: string;
    status_detail: string;
    error: string;
    percent_complete: number;
}

export enum ResponseStatus {
    Pending = 0,
    Running = 1,
    Successful = 2,
    Failed = 3,
    Canceled = 4,
}

export interface axiosConfig {
    headers: {
        'User-Agent': string,
        Accept: string,
    };
    auth: User;
}
