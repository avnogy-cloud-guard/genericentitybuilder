const form = document.querySelector('form');
let EntityName = ""
let RequestParameters = []
let ENRRequestParameters = []

form.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", handleSubmit);
    input.addEventListener("change", handleSubmit);
    input.addEventListener("blur", handleSubmit);
});


function show(who, obj, rev) {
    if ((rev && !obj.checked) || !rev && obj.checked) {

        document.getElementById(who).style.display = 'block';
    } else {
        document.getElementById(who).style.display = 'none';
    }
    handleSubmit()
}

function handleSubmit() {
    const data = new FormData(form);
    let obj = Object.fromEntries(data.entries());
    for (let key in obj) {
        obj[key] = formatInput(obj[key]);
    }
    if (document.getElementById("PropertiesToRemoveFromExternalObject").disabled) {
        obj.PropertiesToRemoveFromExternalObject = ""
    }
    if (document.getElementById("ENRPropertiesToRemoveFromExternalObject").disabled) {
        obj.ENRPropertiesToRemoveFromExternalObject = ""
    }

    obj.RuleTargetType = stripAwsOrEntity(obj.RuleTargetType)

    EntityName = "Aws" + obj.RuleTargetType

    updateRequestParams()

    let BasicEnrichmentConfig = (document.getElementById("ShouldEnrichBaseEntity").checked) ? {
        "ApiCall": stripAsyncOrRequest(obj.ENRApiCall) + "Async",
        "RequestParameters": ENRRequestParameters,
        "RequiredPermissionConfig": {
            "RequiredPermission": obj.ENRRequiredPermission,
            "EntityType": obj.RuleTargetType,
            "EntitySubType": obj.ENRSubType
        },
        "RequestInfo": "Amazon." + obj.AssemblyName + ".Model." + stripAsyncOrRequest(obj.ENRApiCall) + "Request, AWSSDK." + obj.AssemblyName,
        "PaginationMarker": obj.ENRPaginationMarker,
        "RequestParametersFromBaseEntity": {[obj.ENRRequestParametersFromBaseEntityENR]: obj.ENRRequestParametersFromBaseEntityBase},
        "ResponsePropertyToUse": obj.ENRResponsePropertyToUse,
        "PropertiesToRemoveFromExternalObject": formatArray(obj.ENRPropertiesToRemoveFromExternalObject)
    } : undefined;

    if (!isNaN(obj.CronExpression)) obj.CronExpression = obj.CronExpression + "/30 * * * ? *"
    if (!document.getElementById("IsCronTriggered").checked) obj.CronExpression = ""
    if (!document.getElementById("advanced-checkbox").checked) {
        obj.BatchSizeParallelism = ""
        obj.LogFetchTimeThreshold = ""
        obj.ThrottlingBackoffMedian = ""
        obj.ThrottlingBackoffMaxRetry = ""
    }

    let json = {
        "Entity": EntityName, "ComplianceConfig": {
            "RuleTargetType": obj.RuleTargetType,
            "Vendor": "AWS",
            "IsRulesEngineBaseEntity": document.getElementById("IsRulesEngineBaseEntity").checked,
            "AdditionalCollectionsToExposeInRE": obj.AdditionalCollectionsToExposeInRE,
            "ServiceNameInVendor": obj.RuleTargetType
        }, "FetcherConfig": {
            "EntitiesCollection": EntityName + "Entity",
            "ShouldEnrichBaseEntity": document.getElementById("ShouldEnrichBaseEntity").checked,
            "IsCronTriggered": document.getElementById("IsCronTriggered").checked,
            "CronExpression": obj.CronExpression,
            "ContinueWith": formatArray(obj.ContinueWith),
            "BatchSizeParallelism": obj.BatchSizeParallelism,
            "LogFetchTimeThreshold": obj.LogFetchTimeThreshold,
            "ThrottlingBackoffMedian": obj.ThrottlingBackoffMedian,
            "ThrottlingBackoffMaxRetry": obj.ThrottlingBackoffMaxRetry,
        }, "IndexerConfig": {
            "ShouldIndexEntity": document.getElementById("ShouldIndexEntity").checked,
        }, "ApiConfig": {
            "LookupEventSources": formatArray(obj.LookupEventSources),
            "IsRegionLess": document.getElementById("IsRegionLess").checked,
            "ExcludedRegions": formatArray(obj.ExcludedRegions),
            "ResponsePropertyToUse": obj.ResponsePropertyToUse,
            "PropertiesToRemoveFromExternalObject": formatArray(obj.PropertiesToRemoveFromExternalObject),
            "ExternalEntityIdProperty": obj.ExternalEntityIdProperty,
            "ExternalEntityNameProperty": obj.ExternalEntityNameProperty,
            "ExternalEntityTagsProperty": obj.ExternalEntityTagsProperty,
            "ConfigAssemblyInfo": "Amazon." + obj.AssemblyName + ".Amazon" + obj.AssemblyName + "Config, AWSSDK." + obj.AssemblyName,
            "ClientAssemblyInfo": "Amazon." + obj.AssemblyName + ".Amazon" + obj.AssemblyName + "Client,  AWSSDK." + obj.AssemblyName,
            "RequestInfo": "Amazon." + obj.AssemblyName + ".Model." + stripAsyncOrRequest(obj.ApiCall) + "Request, AWSSDK." + obj.AssemblyName,
            "ApiCall": stripAsyncOrRequest(obj.ApiCall) + "Async",
            "RequiredPermissionConfig": {
                "RequiredPermission": obj.RequiredPermission, "EntityType": obj.RuleTargetType
            },
            "RequestParameters": RequestParameters,
            "PaginationMarker": obj.PaginationMarker,
            "IsExternalIdGenerated": document.getElementById("IsExternalIdGenerated").checked,
            "BasicEnrichmentConfig": BasicEnrichmentConfig,
        }
    };
    json = JSON.stringify(json, replacer, 2);
    document.getElementById("result").innerText = json;
    return json;
}

const stripAsyncOrRequest = input => input.toString().replace(/(async|request)$/i, '');
const stripAwsOrEntity = input => input.toString().replace(/^(Aws)(.*)(Entity)$/i, '\$2');

function saveTextAsFile() {
    var textToWrite = handleSubmit()
    var textFileAsBlob = new Blob([textToWrite], {type: 'text/plain'});

    var fileNameToSaveAs = EntityName + ".json";

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
        // Chrome allows the link to be clicked without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
        // Firefox requires the link to be added to the DOM before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = () => {
            document.body.removeChild(event.target);
        };
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}

function isEmpty(value) {
    if (Array.isArray(value)) {
        if (value.length === 0 || value.every(item => item === '')) return true
    }
    return (value === undefined || value === "" || value == null || (typeof value === 'object' && Object.keys(value).length === 0));
}

function replacer(key, value) {
    if (isEmpty(value)) {
        return undefined;
    }
    return value;
}

function formatInput(input) {
    if (isEmpty(input)) return ''
    let trimmedInputValue = input.trim();
    let jsonValue;
    try {
        jsonValue = JSON.parse(trimmedInputValue);
    } catch (e) {
        if (!isNaN(trimmedInputValue)) {
            jsonValue = Number(trimmedInputValue);
        } else {
            jsonValue = trimmedInputValue;
        }
    }
    return jsonValue
}

function formatArray(input) {
    if (isEmpty(input)) return ''

    if (Array.isArray(input) && typeof input[0] === 'string') {
        return input;
    } else {
        input = input.toString().replace(/[\[\] "]/g, '').split(',');

        return input;
    }
}

// function mutuallyExclusive(id1, id2) {
//     let input1 = document.getElementById(id1);
//     let input2 = document.getElementById(id2);
//
//     input1.addEventListener('input', function () {
//         input2.disabled = !!input1.value;
//         input2.placeholder = !!input1.value ? "*" : ""
//
//     });
//
//     input2.addEventListener('input', function () {
//         input1.disabled = !!input2.value;
//         input1.placeholder = !!input2.value ? "" : ""
//
//     });
// }

function updateRequestParams() {
    RequestParameters = []
    ENRRequestParameters = []
    Array.from(document.getElementsByClassName('request-pair')).map((pair) => {
        let name = formatInput(pair.querySelector('input[name="name"]').value)
        let value = formatInput(pair.querySelector('input[name="value"]').value)
        if (name !== '' || value !== '') {
            if (pair.querySelector('input[name="name"]').closest('.request-container').id === "request-container") {
                RequestParameters.push({
                    "ParameterName": name, "ParameterValue": value
                })
            } else {
                ENRRequestParameters.push({
                    "ParameterName": name, "ParameterValue": value
                })
            }
        }
    })
}

function removeInputPair(elem) {
    const requestPair = elem.closest('.request-pair');
    if (requestPair) {
        requestPair.remove();
    }
    handleSubmit()
}

function addRequestParametersAnswer(elem, name = '', value = '') {
    const requestContainer = elem.closest('.request-container');
    const newRequestPair = document.createElement('div');
    newRequestPair.classList.add('request-pair');
    newRequestPair.classList.add('input-container');
    newRequestPair.innerHTML = `
         <input type="text" name="name" placeholder="Name" oninput="handleSubmit()" onblur="handleSubmit()" value="${name}">
         <input type="text" name="value" placeholder="Value" oninput="handleSubmit()" onblur="handleSubmit()" value="${value}">
         <button type="button" class="request-button" onclick="removeInputPair(this)">-</button>
      `;
    requestContainer.appendChild(newRequestPair);
    handleSubmit()
}

function saveToLocalStorage() {
    for (let i = 0; i < form.elements.length; i++) {
        let key = form.elements[i].id;
        let value = form.elements[i].value;
        localStorage.setItem(key, value);
    }
    localStorage.setItem("IsRulesEngineBaseEntity", document.getElementById("IsRulesEngineBaseEntity").checked)
    localStorage.setItem("ShouldEnrichBaseEntity", document.getElementById("ShouldEnrichBaseEntity").checked)
    localStorage.setItem("IsCronTriggered", document.getElementById("IsCronTriggered").checked)
    localStorage.setItem("ShouldIndexEntity", document.getElementById("ShouldIndexEntity").checked)
    localStorage.setItem("IsRegionLess", document.getElementById("IsRegionLess").checked)
    localStorage.setItem("IsExternalIdGenerated", document.getElementById("IsExternalIdGenerated").checked)
    localStorage.setItem("ShouldEnrichBaseEntity", document.getElementById("ShouldEnrichBaseEntity").checked)
    localStorage.setItem("advanced-checkbox", document.getElementById("advanced-checkbox").checked)

    updateRequestParams()
    localStorage.setItem("params", JSON.stringify(RequestParameters))
    localStorage.setItem("enrparams", JSON.stringify(ENRRequestParameters))
}

function loadFromLocalStorage() {
    for (let i = 0; i < form.elements.length; i++) {
        let key = form.elements[i].id;
        form.elements[i].value = localStorage.getItem(key);
    }
    const forceClick = (id) => {
        let elem = document.getElementById(id);
        let value = localStorage.getItem(id) === "true"
        let state = elem.checked
        if (value !== state) {
            elem.click()
        }
    }
    forceClick("IsRulesEngineBaseEntity")
    forceClick("ShouldEnrichBaseEntity")
    forceClick("IsCronTriggered")
    forceClick("ShouldIndexEntity")
    forceClick("IsRegionLess")
    forceClick("IsExternalIdGenerated")
    forceClick("ShouldEnrichBaseEntity")
    forceClick("advanced-checkbox")

    form.querySelectorAll(".request-pair").forEach(pair => {
        pair.remove(self)
    });

    const params = JSON.parse(localStorage.getItem("params"))
    for (let i = 0; i < params.length; i++) {
        const RequestContainer = document.getElementById("request-container")
        const current = params[i]
        addRequestParametersAnswer(RequestContainer, current["ParameterName"], current["ParameterValue"])
    }
    const enrparams = JSON.parse(localStorage.getItem("enrparams"))
    for (let i = 0; i < enrparams.length; i++) {
        const RequestContainer = document.getElementById("enr-request-container")
        const current = enrparams[i]
        addRequestParametersAnswer(RequestContainer, current["ParameterName"], current["ParameterValue"])
    }

    handleSubmit()
}

// mutuallyExclusive("ResponsePropertyToUse", "PropertiesToRemoveFromExternalObject")
// mutuallyExclusive("ENRResponsePropertyToUse", "ENRPropertiesToRemoveFromExternalObject")
