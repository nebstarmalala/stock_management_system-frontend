export default {
  data: () => ({
    accountNumberRules: [
      v => !!v || 'Account number is required',
      v => (v || '').length <= 10 || 'Account number can not exceed 10 digits',
    ],
    emailRules: [v => !!v || 'E-mail is required', v => !v || /.+@.+\..+/.test(v) || 'E-mail must be valid'],
    optionalEmailRules: [v => !v || /.+@.+\..+/.test(v) || 'E-mail must be valid'],
    nameRules: [v => !!v || 'Full name is required'],
    phoneRules: [
      v => !!v || 'Phone number is required',
      v => !v || v.startsWith('07') || v.startsWith('011') || 'Phone number must start with 07 or 011',
      v => Number.isInteger(Number(v)) || 'Phone number must contain numbers only',
      v => (v || '').length <= 10 || 'Phone number can not exceed 10 digits',
    ],
    meterPhoneRules: [
      v => !v || v.startsWith('254') || 'Phone number must start with 254',
      v => !v || Number.isInteger(Number(v)) || 'Phone number must contain numbers only',
      v => !v || (v || '').length <= 15 || 'Phone number can not exceed 15 digits',
    ],
    numberRules: [v => !!v || 'required', v => v > 0 || 'The value must be greater than 0'],
    optionalNumberRules: [v => !v || v > 0 || 'The value must be greater than 0'],
    numberRulesAllowZero: [v => v >= 0 || 'The value must be greater than or equal to 0'],
    optionalPhoneRules: [
      v => !v || v.startsWith('07') || v.startsWith('011') || 'Phone number must start with 07 or 011',
      v => Number.isInteger(Number(v)) || 'Phone number must contain numbers only',
      v => (v || '').length <= 10 || 'Phone number can not exceed 10 digits',
    ],
    requiredRules: [v => !!v || 'required'],
  }),
}
