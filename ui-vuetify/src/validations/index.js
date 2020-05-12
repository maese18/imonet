export default {
  //  title: [v => !v || 'Title is required', v => (v && v.length <= 256) || 'Title must be less than 256 characters'],
  title: [
    v => {
      console.log('title validation v=', v);
      return true;
    },
  ],
  nameRules: [v => !!v || 'Name is required', v => (v && v.length <= 10) || 'Name must be less than 10 characters'],
  emailRules: [v => !!v || 'E-mail is required', v => /.+@.+\..+/.test(v) || 'E-mail must be valid'],
};
