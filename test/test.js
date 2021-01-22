var AsyncCtrl = require("../umd/async-ctrl.js");
var generateDelay = function(range, base) { return Math.random() * range + base; };
var actions = AsyncCtrl([
    function(success, failure, value) {
        setTimeout(function() { success(value + 10); }, generateDelay(2000, 1000));
        setTimeout(function() { failure(-value); }, generateDelay(4000, 1000));
    },
    [function(success, failure, value, scope) {
        setTimeout(function() {
            if ( ++scope.successes$ === 3 ) success(value + 10);
        }, generateDelay(2000, 1000));
        setTimeout(function() {
            if ( ++scope.failures$ === 3 ) failure(-value);
        }, generateDelay(4000, 1000));
    },function(success, failure, value, scope) {
        setTimeout(function() {
            if ( ++scope.successes$ === 3 ) success(value + 11);
        }, generateDelay(2000, 1000));
        setTimeout(function() {
            if ( ++scope.failures$ === 3 ) failure(-value);
        }, generateDelay(4000, 1000));
    },function(success, failure, value, scope) {
        setTimeout(function() {
            if ( ++scope.successes$ === 3 ) success(value + 12);
        }, generateDelay(2000, 1000));
        setTimeout(function() {
            if ( ++scope.failures$ === 3 ) failure(-value);
        }, generateDelay(4000, 1000));
    }],
    function(success, failure, value) {
        setTimeout(function() { success(value + 10); }, generateDelay(2000, 1000));
        setTimeout(function() { failure(-value); }, generateDelay(2000, 1000));
    },
]);
console.log("*****************************************************");
console.log("  Repeatedly executing a list of tasks");
console.log("  each of which may fail. If all the tasks succeed");
console.log("  a number from 40 to 42 is displayed");
console.log("  otherwise a negative number reflecting");
console.log("  the last successful stage is displayed" );
console.log("*****************************************************");
var iterations = 10;
var performActions = function() {
    var startTime = (new Date()).valueOf();
    actions(10)
        .onSuccess(function(value) {
            var execTime = Math.floor((new Date()).valueOf() - startTime);
            console.log( "+" + value + " /" + execTime );
            if ( --iterations > 0 ) performActions();
            else console.log( "DONE" );
        })
        .onFailure(function(value) {
            var execTime = Math.floor((new Date()).valueOf() - startTime);
            console.log( value + " /" + execTime );
            if ( --iterations > 0 ) performActions();
            else console.log( "DONE" );
        });
};
performActions();
