 (function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.AsyncCtrl = factory();
    }
})(this, function() {
    'use strict';
    return function(tasks) {
        var tasksNumber = tasks.length;
        var tasksList = [];
        for ( var i=0; i < tasks.length; i++ ) {
            if ( typeof tasks[i] === "function" ) tasksList[i] = [ tasks[i] ];
            else if ( tasks[i] instanceof Array ) tasksList[i] = tasks[i].slice(0);
            else return null;
        }
        return function(initValue, innerScope) {
            var pointer = 0;
            var reporters = [];
            var listeners = {
                success: null,
                failure: null,
            };
            var resultUnsettled = {};
            var result = {
                success: resultUnsettled,
                failure: resultUnsettled,
            };
            var scope = {};
            if ( innerScope instanceof Object ) {
                for ( var i in innerScope ) {
                    if ( !innerScope.hasOwnProperty(i) ) continue;
                    if ( i === "successes$" ||
                        i === "failures$" ||
                        i === "values$" )
                            continue;
                    scope[i] = innerScope[i];
                }
            }
            for ( var i=0; i <= tasksNumber; i++ )
                (function(taskIndex) {
                    reporters.push({
                        success: function(value) {
                            if ( pointer !== taskIndex ) return;
                            if ( ++pointer > tasksNumber ) {
                                result.success = value;
                                if ( listeners.success ) listeners.success(value);
                            } else {
                                var success = reporters[taskIndex + 1].success;
                                var failure = reporters[taskIndex + 1].failure;
                                var actions = tasksList[taskIndex];
                                scope.successes$ = 0;
                                scope.failures$ = 0;
                                scope.values$ = [];
                                try {
                                    for ( var i=0; i < actions.length; i++ )
                                        actions[i](success, failure, value, scope);
                                }
                                catch (error) { failure(error); }
                            }
                        },
                        failure: function(value) {
                            if ( pointer !== taskIndex ) return;
                            result.failure = value;
                            pointer = tasksNumber + 1;
                            if ( listeners.failure ) listeners.failure(value);
                        },
                    });
                })(i);
            reporters[0].success(initValue);
            var instance = {
                onSuccess: function(listener) {
                    listeners.success = listener;
                    if ( result.success !== resultUnsettled )
                        listener(result.success);
                    return instance;
                },
                onFailure: function(listener) {
                    listeners.failure = listener;
                    if ( result.failure !== resultUnsettled )
                        listener(result.failure);
                    return instance;
                },
                failure: function(value) {
                    result.failure = value;
                    pointer = tasksNumber + 1;
                    if ( listeners.failure ) listeners.failure(value);
                },
            };
            return instance;
        };
    };
});