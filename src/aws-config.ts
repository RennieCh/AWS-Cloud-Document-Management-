import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: "us-east-1",
    userPoolId: "us-east-1_NozcAgT57",
    userPoolWebClientId: "5us2mlj9f8ga2m428dcvk85urp",
  },
});
