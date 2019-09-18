const validationRules = require('./config').validation;

const generateFormErrors = (errors) => {
    let errorList = [];
    console.log(errors)
    for (field in errors) {
        if (errors[field].properties.type === 'user defined') {
            let message = `Password must have ${validationRules.passwordLength} letters`;
            if (validationRules.passwordAlphaNumeric) {
                message = `Password must have ${validationRules.passwordLength} letters and should be alphanumeric`
            }
            errorList.push(message)
        } else {
            errorList.push(errors[field].properties.path + ' ' + errors[field].properties.type)
        }

    }
    return errorList
}


module.exports = generateFormErrors;