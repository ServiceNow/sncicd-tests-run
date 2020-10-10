# ServiceNow CI/CD GitHub Action for Run Tests

Start a specified automated test suite.

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

## Support Model

ServiceNow built this integration with the intent to help customers get started faster in adopting CI/CD APIs for DevOps workflows, but __will not be providing formal support__. This integration is therefore considered "use at your own risk", and will rely on the open-source community to help drive fixes and feature enhancements via Issues. Occasionally, ServiceNow may choose to contribute to the open-source project to help address the highest priority Issues, and will do our best to keep the integrations updated with the latest API changes shipped with family releases. This is a good opportunity for our customers and community developers to step up and help drive iteration and improvement on these open-source integrations for everyone's benefit. 

## Governance Model

Initially, ServiceNow product management and engineering representatives will own governance of these integrations to ensure consistency with roadmap direction. In the longer term, we hope that contributors from customers and our community developers will help to guide prioritization and maintenance of these integrations. At that point, this governance model can be updated to reflect a broader pool of contributors and maintainers. 
