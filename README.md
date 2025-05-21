
API Documentation

 Overview

- Authentication: JWT Bearer tokens returned by the Auth endpoints. Send with the `Authorization: Bearer <token>` header.
- Rate limiting: Public auth and social‑auth endpoints are protected by Express‑Rate‑Limit middleware (see code).
- Roles: `user` (default) and `admin`.  Where admin is required it is explicitly indicated.



1. Health
2. Authentication
3. Styles
4. Tattoos
5. Collections


 1  Health

| Method | Path          | Auth | Description                                      |
| ------ | ------------- | ---- | ------------------------------------------------ |
| `GET`  | `/api/health` | None | Simple health‑check, returns `{ status: "OK" }`. |

---

  2  Authentication 

# Public

| Method | Path                          | Body                            | Description                                                                       |
| ------ | ----------------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| `POST` | `/api/auth/register`          | `{ username, email, password }` | Create a new user account.                                                        |
| `POST` | `/api/auth/login`             | `{ email, password }`           | Login and receive a JWT.                                                          |
| `GET`  | `/api/auth/google`            | –                               | Redirects user to Google OAuth. Rate‑limited.                                     |
| `GET`  | `/api/auth/google/callback`   | –                               | Google OAuth callback. Success ⇒ /login/success, failure ⇒ /login/failed. |
| `GET`  | `/api/auth/facebook`          | –                               | Redirects user to Facebook OAuth.                                                 |
| `GET`  | `/api/auth/facebook/callback` | –                               | Facebook OAuth callback.                                                          |
| `GET`  | `/api/auth/login/failed`      | –                               | Social‑auth error payload.                                                        |
| `GET`  | `/api/auth/login/success`     | –                               | Social‑auth success payload incl. JWT.                                            |

# Protected (requires JWT)

| Method | Path                        | Body                                        | Description                              |
| ------ | --------------------------- | ------------------------------------------- | ---------------------------------------- |
| `GET`  | `/api/auth/profile`         | –                                           | Get current user profile.                |
| `PUT`  | `/api/auth/profile`         | Partial `{ firstName?, lastName?, email? }` | Update profile. Validates unique e‑mail. |
| `PUT`  | `/api/auth/change-password` | `{ currentPassword, newPassword }`          | Change password (verifies current).      |

---

 3  Styles 

| Method | Path                | Auth      | Body                                | Description                              |
| ------ | ------------------- | --------- | ------------------------------------| ----------------------------------       |
| `GET`  | `/api/styles`       | None      | –                                   | List all tattoo styles.                  |
| `GET`  | `/api/styles/:id`   | None      | –                                   | Retrieve single style by `id`.           |     
| `POST` | `/api/styles`       | admin     | `{ name, description, imageUrl }`   | Create a new style. Name must be unique. |
| `PUT`  | `/api/styles/:id`   | admin     | `{ name?, description?, imageUrl? }`| Update style.                            |
| `DELETE`| `/api/styles/:id`  | admin     | –                                   | Delete style.                            |

---

 4  Tattoos 

# Public

| Method | Path                    | Body                               | Description                                                     |
| ------ | ----------------------- | ---------------------------------- | --------------------------------------------------------------- |
| `GET`  | `/api/tattoos`          | –                                  | List recent tattoo results (includes style + creator username). |
| `GET`  | `/api/tattoos/:id`      | –                                  | Get specific tattoo result.                                     |
| `POST` | `/api/tattoos/generate` | See Generate Tattoo body below     | Generate 1‑n tattoo designs via Replicate API and save.         |

 Generate Tattoo – Request Body

```
{
  "prompt": "<subject description>",
  "styleName": "<existing Style.name>",
  "referenceImage": "<optional https://... or multipart file>",
  "negativePrompt": "<optional negative terms>",
  "width": 512,
  "height": 512,
  "scheduler": "K_EULER",
  "numOutputs": 2,
  "guidanceScale": 7.0,
  "numInferenceSteps": 30,
  "strength": 0.6
}
```

Returns a map of outputs keyed by index with metadata and hosted `imageUrl`.

# Authenticated User

| Method   | Path                             | Body | Description                                    |
| -------- | -------------------------------- | ---- | ---------------------------------------------- |
| `POST`   | `/api/tattoos/:id/save`          | –    | Save tattoo result to user’s SavedDesign list. |
| `DELETE` | `/api/tattoos/:id/unsave`        | –    | Remove saved design.                           |
| `GET`    | `/api/tattoos/saved/designs`     | –    | List user’s saved designs.                     |
| `GET`    | `/api/tattoos/saved/designs/:id` | –    | Get a single saved design.                     |

# Admin

| Method   | Path               | Description                              |
| -------- | ------------------ | ---------------------------------------- |
| `DELETE` | `/api/tattoos/:id` | Delete a tattoo result (controller TBD). |

---

 5  Collections 

All collection endpoints require authentication (`user` or above).

| Method   | Path                                     | Body           | Description                                |
| -------- | ---------------------------------------- | -------------- | ------------------------------------------ |
| `GET`    | `/api/collections`                       | –              | List the authenticated user’s collections. |
| `GET`    | `/api/collections/:id`                   | –              | Get a collection with the designs inside.  |
| `POST`   | `/api/collections`                       | `{ name }`     | Create a new collection.                   |
| `PUT`    | `/api/collections/:id`                   | `{ name }`     | Rename collection.                         |
| `DELETE` | `/api/collections/:id`                   | –              | Delete collection.                         |
| `POST`   | `/api/collections/:id/designs`           | `{ designId }` | Add a saved design to collection.          |
| `DELETE` | `/api/collections/:id/designs/:designId` | –              | Remove design from collection.             |

---

 Error Format

On error the API returns JSON:

```json
{
  "message": "<human‑readable details>"
}
```

HTTP status codes follow conventional semantics (400‑series for client errors, 500 for unexpected server errors).

---

 Rate Limits

| Endpoint Group                          | Limit Middleware    |
| --------------------------------------- | ------------------- |
| `/api/auth/register`, `/api/auth/login` | `authLimiter`       |
| Social OAuth routes                     | `socialAuthLimiter` |
