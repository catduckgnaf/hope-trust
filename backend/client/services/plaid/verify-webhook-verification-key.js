const { plaidClient } = require("./index");
const compare = require("secure-compare");
const jwt_decode = require("jwt-decode");
const jwt_token = require("jsonwebtoken");
const JWT = require("jose");
const sha256 = require("js-sha256");
const KEY_CACHE = new Map();

const verifyJWT = async (body, json_web_token) => {
    const signedJwt = json_web_token;
    const decodedToken = jwt_decode(signedJwt);
    const decodedTokenHeader = jwt_decode(signedJwt, { header: true });
    const algorithm = decodedTokenHeader.alg;
    const currentKeyID = decodedTokenHeader.kid;
    if (algorithm !== "ES256") return false;
    if (!KEY_CACHE.has(currentKeyID)) {
        const keyIDsToUpdate = [];
        KEY_CACHE.forEach((keyID, key) => {
            if (key.expired_at == null) keyIDsToUpdate.push(keyID);
        });
        keyIDsToUpdate.push(currentKeyID);
        for (const keyID of keyIDsToUpdate) {
            const response = await plaidClient
                .webhookVerificationKeyGet({ key_id: keyID })
                .catch((err) => {
                    return false;
                });
            const new_key = response.data.key;
            KEY_CACHE.set(keyID, new_key);
        }
    }
    if (!KEY_CACHE.has(currentKeyID)) return false;
    const key = KEY_CACHE.get(currentKeyID);
    if (key.expired_at != null) return false;
    try {
        const keyLike = await JWT.importJWK(key);
        jwt_token.verify(signedJwt, keyLike, { maxAge: "5 min", algorithms: ["ES256"] });
    } catch (error) {
        return false;
    }
    const bodyHash = sha256(body);
    const claimedBodyHash = decodedToken.request_body_sha256;
    return compare(bodyHash, claimedBodyHash);
};

module.exports = verifyJWT;