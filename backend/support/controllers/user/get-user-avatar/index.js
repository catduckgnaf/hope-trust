const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { cognito_id } = event.pathParameters;
  const avatar = await database.queryOne("SELECT avatar from users where cognito_id = $1 AND avatar IS NOT NULL AND version = (SELECT MAX (version) FROM users where cognito_id = $1)", cognito_id);
  let default_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAAAAABVicqIAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfmCgwTEh/nM5UpAAADsklEQVRo3u2ZaXPaMBCGd+WLy+FqyVEgdPL//1A76ZV2YNJgDoPjS95+oAedWvLadTqdFn1hQJaffSVZ+67B9/D0TfwBxglygpwgJ0jdzSx3OX79pKeDoIzDSILhNGyjDKYMJPK8XZIBgLA6g4FTIjhuPsH4fh7Q9+nC1uXI5qrhQnD7bvUdccD0Z2dMCne6lrcBHjMAwQtvBrzBvC2Mq9cB/vJj8HqFrOEsCO7fhDm3w/DNnkVhQeSHXe7NcPdB1gXB5YMiYHxYcqRwIOlCGa9cpPVA0N8qw8Wtz5DCUbLWRJuu61EifV2vz1h6BiQNdb0hY1GKIZhKzbSjTIsXhaEk055QlNWhBPC3unkQMgxdt8FIXwwlpi5vkM04xzmQtq63XQ8Eu5qLRLeeJ566TeV8UbPLyI6cY8UZqc+uEcdPsPLJeUcRLnXOOeNZkMZUsbrmtFEbhIaT/Mw4GbL8CtNIjMfI/TVPMOsqENfWXfzzHcmeXDHtOtd3iXHnbp39wJDoT3rMsSW8cL/j3fvJYQ3QckcDi+252V4YAFAG/j6SYDhtt1XG1pdx9SRcl4gAEYGeqnQAIABEKFsD/UM14wny90FKbGEEAMqAAEGU28dMCEKWxlEYxYkkQMOynYZjm4IJYkAQsiTwd4+RPPKSKAyn2XFbFgdUeHZhFm7XfiTpF6tIgIbj9s4aoghTAMF4s9xEmdKLEginO+wWvDbQQ8KHz3tZlP3IaD9/ps31GghG94uAOAmWsHUxctRq1BBa3vksxAHjToZqd6aAYHS3YJQ3RxjzYqISo9jCuL9dcSqPoxHyU3DTzqfkHysYvPLKEA7NexXkx5UPiW83pWR8DW1zG5eAzL0KDAD05mwIPi5KJvFvjRaPedHlKlmHlYQAYLjmKqFdRSGqoblKGhWFAGDu8ZILuehXXZP+BRtiz5qVKNSc2WwIuTOrCsSaubnBKYzEaFrBYYjpSNGhGHDFLKKOGo6vFD2qHC+m8JHx/ud4xFipXjkrYnpdpgQh41o9w2q3Isb2O/aTT42Z+o2CzhLhefPthgnpvTzT9GqNBEaf5kmxGLIuXzi6qS3yXeuPq0yPIdEf9/Q3KXKQfXc532owJLqXQ7NghxRXv5is7jdJbsInsLqjfnGpzSmxUe69dZDQ8UtNAkCr1Ru0OfucV8cjpMFuF0RpdnhAhTCdVqfTMnm2nv/HGZBM4ySVBGiYlm0ayK5Q2EUQARhG4/hr7UXQj1tXaf9OYXqCnCAnyP8E+QLRyz6vDe6VEAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0xMC0xMlQxOToxODoyMCswMDowMM1LCcMAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMTAtMTJUMTk6MTg6MjArMDA6MDC8FrF/AAAAAElFTkSuQmCC";
  const base64ContentArray = (avatar && avatar.avatar) ? avatar.avatar.split(",") : default_image.split(",");
  const mime_type = base64ContentArray[0].match(/[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/)[0];
  const base64Data = base64ContentArray[1];
  return {
    statusCode: 200,
    headers: {
      ...getHeaders(),
      "Content-type": mime_type
    },
    body: base64Data.toString("base64"),
    isBase64Encoded: true
  };
};
