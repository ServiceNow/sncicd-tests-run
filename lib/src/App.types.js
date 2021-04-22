"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseStatus = exports.Errors = void 0;
var Errors;
(function (Errors) {
    Errors["USERNAME"] = "nowUsername is not set";
    Errors["PASSWORD"] = "nowPassword is not set";
    Errors["INSTALL_INSTANCE"] = "nowInstallInstance is not set";
    Errors["SUITE_SYS_ID_OR_NAME"] = "Set testSuiteSysId or testSuiteName please";
    Errors["INCORRECT_CONFIG"] = "Configuration is incorrect";
    Errors["CANCELLED"] = "Canceled";
    Errors["TESTS_FAILED"] = "Testsuite run failed";
    Errors["TEST_SUITE_FAILED"] = "Testsuite failed";
})(Errors = exports.Errors || (exports.Errors = {}));
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["Pending"] = 0] = "Pending";
    ResponseStatus[ResponseStatus["Running"] = 1] = "Running";
    ResponseStatus[ResponseStatus["Successful"] = 2] = "Successful";
    ResponseStatus[ResponseStatus["Failed"] = 3] = "Failed";
    ResponseStatus[ResponseStatus["Canceled"] = 4] = "Canceled";
})(ResponseStatus = exports.ResponseStatus || (exports.ResponseStatus = {}));
