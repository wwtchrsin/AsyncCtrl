## Controller of consecutive or concurrent execution of a sequence of asynchronous operations

## Example
```javascript
var AsyncCtrl = require("async-ctrl");
var initialValue = 1;
var scopeObject = {};
AsyncCtrl([
    function(success, failure, value, scope) {
        setTimeout(function() { 
            success(value * 2);
        }, 1500);
    },
    [function(success, failure, value, scope) {
        setTimeout(function() { 
            if ( ++scope.successes$ === 2 )
                success(value * 3);
        }, 2500);
    }, function(success, failure, value, scope) {
        setTimeout(function() { 
            if ( ++scope.successes$ === 2 )
                success(value * 2);
        }, 1500);
    }, function(success, failure, value, scope) {
        setTimeout(function() { 
            failure(-value);
        }, 3500);
    }],
])(initialValue, scopeObject)
    .onSuccess(function(value) {
        console.log(value); //6
    })
    .onFailure(function(error) {
        console.error(error);
    });
```

## Usage
The first step is defining the task list. 
The entry point function (**AsyncCtrl**) accepts this list and return
controller's constructor for this list and its invocation starts the execution.
That constructor accepts two optional arguments: initial value
for the first task and object meant to imitate the inner scope of the tasks.
The constructor returns controller's instance with **onSuccess(handler)** and 
**onFailure(handler)** methods for assigning the execution outcome handlers.
The fact of the handlers' invocations is independent of the time they were assigned.
It is possible to terminate the further execution by calling the **failure(error)** 
method of the instance in which case the failure handlers will be invoked.
Ultimately only one group of handlers will be triggered.

## Convention
The list of tasks is an array containing consecutively executed tasks.
Each of these tasks is a function or an array of functions being invoked
simultaneously. Successfulness is reported via the first argument of the function
and an error via the second one. For each task only the first such report takes effect.
Once a successful result is reported the execution process proceeds to the next task
or is terminated in case of an error. Each function receives
the successful result of the previous task via the third argument and the scope object
via the fourth argument. Before the execution of the next task begins
the attribute **values$** of the scope object is assigned to an empty array
and the attributes **successes$** and **failures$** are assigned to a value **0**
which enables communications between concurrently executed functions.
The last task's successful result or an error report will be passed
to the appropriate outcome handlers.
