const form = document.querySelector('form');

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
}

function addAnswer() {
    let input = document.getElementById('ContinueWithInput');
    let text = input.value;
    if (text !== '') {
        let li = document.createElement('li');
        li.textContent = text;
        li.addEventListener('click', function () {
            this.parentNode.removeChild(this);
            handleSubmit()
        });
        document.getElementById('ContinueWithList').appendChild(li);
        input.value = '';
    }
    handleSubmit()
}

function handleSubmit() {
    const data = new FormData(form);
    let obj = Object.fromEntries(data.entries());

    let ContinueWith = Array.from(document.querySelectorAll('#ContinueWithList li')).map(function (li) {
        return li.textContent;
    });

    let BasicEnrichmentConfig = (document.getElementById("ShouldEnrichBaseEntity").checked) ? {
        "ApiCall": obj.ENRRequestName,
        "RequestParameters": obj.ENRRequestParameters,
        "RequiredPermissionConfig": {
            "RequiredPermission": obj.ENRRequiredPermission,
            "EntityType": obj.ruleTargetType,
            "EntitySubType": obj.ENRSubType
        },
        "RequestInfo": "Amazon." + obj.AssemblyName + ".Model." + obj.ENRRequestName + ", AWSSDK." + obj.AssemblyName,
        "PaginationMarker": obj.ENRPaginationMarker,
        "RequestParametersFromBaseEntity": obj.ENRRequestParametersFromBaseEntity,
        "ResponsePropertyToUse": obj.ENRResponsePropertyToUse,
        "PropertiesToRemoveFromExternalObject": obj.ENRPropertiesToRemoveFromExternalObject
    } : undefined;


    let json = {
        "Entity": "AWS" + obj.ruleTargetType, "ComplianceConfig": {
            "RuleTargetType": obj.ruleTargetType,
            "Vendor": "AWS",
            "IsRulesEngineBaseEntity": document.getElementById("IsRulesEngineBaseEntity").checked,
            "AdditionalCollectionsToExposeInRE": obj.AdditionalCollectionsToExposeInRE,
            "ServiceNameInVendor": obj.ruleTargetType
        }, "FetcherConfig": {
            "EntitiesCollection": "AWS" + obj.ruleTargetType + "Entity",
            "ShouldEnrichBaseEntity": document.getElementById("ShouldEnrichBaseEntity").checked,
            "IsCronTriggered": document.getElementById("IsCronTriggered").checked,
            "CronExpression": obj.cronExpression + "/30 * * * ? *",
            "ContinueWith": ContinueWith,
        }, "IndexerConfig": {
            "ShouldIndexEntity": document.getElementById("ShouldIndexEntity").checked,
        }, "ApiConfig": {
            "LookupEventSources": formatArray(obj.LookupEventSources),
            "IsRegionLess": document.getElementById("IsRegionLess").checked,
            "ExcludedRegions": obj.ExcludedRegions,
            "ResponsePropertyToUse": obj.ResponsePropertyToUse,
            "ExternalEntityIdProperty": obj.ExternalEntityIdProperty,
            "ExternalEntityNameProperty": obj.ExternalEntityNameProperty,
            "ExternalEntityTagsProperty": obj.ExternalEntityTagsProperty,
            "ConfigAssemblyInfo": "Amazon." + obj.AssemblyName + ".Amazon" + obj.AssemblyName + "Config, AWSSDK." + obj.AssemblyName,
            "ClientAssemblyInfo": "Amazon." + obj.AssemblyName + ".Amazon" + obj.AssemblyName + "Client,  AWSSDK." + obj.AssemblyName,
            "RequestInfo": "Amazon." + obj.AssemblyName + ".Model." + obj.RequestName + ", AWSSDK." + obj.AssemblyName,
            "ApiCall": obj.RequestName,
            "RequiredPermissionConfig": {
                "RequiredPermission": obj.RequiredPermission, "EntityType": obj.ruleTargetType
            },
            "RequestParameters": obj.RequestParameters,
            "PaginationMarker": obj.PaginationMarker,
            "MaxPages": obj.MaxPages,
            "IsExternalIdGenerated": document.getElementById("IsExternalIdGenerated").checked,
            "BasicEnrichmentConfig": BasicEnrichmentConfig,
        }
    };

    document.getElementById("result").innerText = JSON.stringify(json, replacer, 2);
}

function isEmpty(value) {
    return (typeof value === undefined || value === "" || value === '' || value == null || value === {} || value === [] || value.length === 0)
}

function replacer(key, value) {
    if (isEmpty(value)) {
        return undefined;
    }
    return value;
}

function formatArray(input) {
    try {
        const parsedInput = JSON.parse(input);
        if (Array.isArray(parsedInput) && typeof parsedInput[0] === 'string') {
            return parsedInput;
        }
    } catch (e) {
    }
    input = input.replace(/[\[\]"]/g, '');
    return [input];
}