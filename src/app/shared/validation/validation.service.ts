export class ValidationService {
    static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
        let config = {
            'required': 'This field is required',
            'invalidEmailAddress': 'Please enter valid email address.',
            'invalidUsername': 'Space not allowed in username.',
            'invalidPhone': 'Please enter valid phone number.',
            'invalidNumber' : 'Please enter valid number.',
            'invalidDate' : 'Please enter valid date, like DD-MM-YYYY.',
            'minlength': `Minimum length ${validatorValue.requiredLength}`
        };
        return config[validatorName];
    }

    static emailValidator(control) {
        // RFC 2822 compliant regex

        if (control.value!='' && !control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return { 'invalidEmailAddress': true };
        } else {
            return null;
        }
    }

    static phoneValidator(control) {
        // (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890, +31636363634, 075-63546725
        if (control.value!='' && !control.value.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s]?[0-9]{3}[-\s]?[0-9]{4,6}$/)) {
            return { 'invalidPhone': true };
        } else {
            return null;
        }
    }

    static usernameValidator(control): { [key: string]: any } {

        if (control.value!='' && !control.value.match(/\s/g)) {
            return { 'invalidUsername': true };
        } else {
            return null;
        }

    }

    static numberValidator(control) {
        // (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890, +31636363634, 075-63546725
        if (control.value!='' && !control.value.match(/^\d{0,9}$/)) {
            return { 'invalidNumber': true };
        } else {
            return null;
        }
    }

    static dateValidator(control) {
       
        if (control.value!='' && !control.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return { 'invalidDate': true };
        } else {
            return null;
        }
    }

    static fieldRequiredValidator(control) {
       
        if (control.value!='') {
            return null;
        } else {
            return { 'required': true };
        }
    }
}
