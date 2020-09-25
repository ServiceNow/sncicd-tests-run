# ServiceNow Run Tests

Start a specified automated test suite.

### Requirements
- nodejs version >= 12
### DevDependecies
- [jest](https://github.com/facebook/jest)
- [prettier](https://github.com/prettier/prettier)
- [eslint](https://github.com/eslint/eslint)
- [ts-jest](https://github.com/kulshekhar/ts-jest)
- [typescript](https://github.com/microsoft/TypeScript)
- [@types/jest](https://www.npmjs.com/package/@types/jest)
- [@types/node](https://www.npmjs.com/package/@types/node)
- [@typescript-eslint/eslint-plugin](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin)
- [@typescript-eslint/parser](https://www.npmjs.com/package/@typescript-eslint/parser)
- [eslint-config-prettier](npmjs.com/package/eslint-config-prettier)
- [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier)

### Dependencies
- [@actions/core](https://github.com/actions/toolkit/tree/master/packages/core)
- [@actions/github](https://github.com/actions/toolkit/tree/master/packages/github)
- [axios](https://github.com/axios/axios)

# Usage
## Step 1: Collect the data from ServiceNow
Collect all required data from the ServiceNow - username, password, instance
## Step 2: Configure Secrets in your GitHub repository
On GitHub, go in your repository settings, click on the secret _Secrets_ and create a new secret.

Create secrets called 
- `SNOW_USERNAME`
- `SNOW_PASSWORD`
- `SNOW_INSTALL_INSTANCE` **domain** only required from the url like https://**domain**.service-now.com

## Step 3: Configure the GitHub action
```yaml
- name: Run Tests 
  uses: ServiceNow/sncicd_tests_run@1.0 # like username/repo-name
  with:
    browserName:
    browserVersion:
    osName:
    osVersion:
    testSuiteSysId:
    testSuiteName:
  env:
    snowUsername: ${{ secrets.SNOW_USERNAME }}
    snowPassword: ${{ secrets.SNOW_PASSWORD }}
    snowInstallInstance: ${{ secrets.SNOW_INSTALL_INSTANCE }}
```
Inputs:
- **browserName** - Name of the browser to use to run the client test. 
- **browserVersion** - Starting value of the version of the browser specified in browser_name to use to run the test. For example, if you enter '9', that would enable all 9.x.x.x versions
- **osName** - Name of the operating system under which to run the test suite.
- **osVersion** - Starting value of the version of the operating system under which to run the test suite. For example, if you enter '8', that would enable all 8.x.x.x versions.
- **testSuiteSysId** - Required if testSuiteName is not specified. The sys_id of the test suite to run. This value is located in the Test [sys_atf_test_suite] table.
- **testSuiteName** - Required if testSuiteSysId is not specified. The name of the test suite to run. This value is located in the Test [sys_atf_test_suite] table.

Environment variable should be set up in the Step 1
- snowUsername - Username to ServiceNow instance
- snowPassword - Password to ServiceNow instance
- snowInstallInstance - ServiceNow instance on which the tests are run

## Tests

Tests should be ran via npm commands:

#### Unit tests
```shell script
npm run test
```   

#### Integration test
```shell script
npm run integration
```   

## Build

```shell script
npm run buid
```

## Formatting and Linting
```shell script
npm run format
npm run lint
```
