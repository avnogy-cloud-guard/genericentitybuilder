const result_elem = document.getElementById("result");

function show(who,obj,rev){
    if ((rev && !obj.checked) || !rev && obj.checked) {

        document.getElementById(who).style.display = 'block';
    } else {
        document.getElementById(who).style.display = 'none';
    }
}


function isEmpty(value) {
    return (typeof value === undefined || value === "" || value === '' || value === null || value === {} || value === [])
}

function replacer(key, value) {
    if (isEmpty(value)) {
        return undefined;
    }
    return value;
}

function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    let obj = Object.fromEntries(data.entries());

    let BasicEnrichmentConfig = (document.getElementById("ShouldEnrichBaseEntity").checked) ? {
        "ApiCall": obj.ENRRequestName,
        "RequestParameters": obj.ENRRequestParameters,
        "RequiredPermissionConfig": {
            "RequiredPermission": obj.ENRRequiredPermission, "EntityType": obj.ruleTargetType, "EntitySubType": obj.ENRSubType
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
            "cronExpression": obj.cronExpression + "/30 * * * ? *",
        }, "IndexerConfig": {
            "ShouldIndexEntity": document.getElementById("ShouldIndexEntity").checked,
        }, "ApiConfig": {
            "LookupEventSources": obj.LookupEventSources,
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

    result_elem.innerText = JSON.stringify(json, replacer, 2);
}

const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);