# API

## Common response format

A successful response MUST contain a meta and an item or an items object. The meta property can contain additional data such as request headers or other info.

Example response for items:
```
{
  "meta": {
    "headers": {
      "accept": "*/*",
      "cache-control": "no-cache",
    }
  },
  "items": [
    {
      "id": 1,
      "title": "First Object",
      "mediaFiles": []
    },
    {...}
  ]
}
```

Example response for a single item:
```
{
  "meta": {
    "headers": {
      "accept": "*/*",
      "cache-control": "no-cache",
    }
  },
  "item": 
    {
      "id": 1,
      "title": "First Object",
      "mediaFiles": []
    }
}
```

Erroneous responses MUST replace the item/items attribute with an errors array.

If using axios the response object is packed within the ***data*** property.

## RealEstates
------

### GET /api/realEstates

#### Function: 
Returns all realEstates objects for the tenant identified by the JwtToken
#### Headers: 

- Authorization: "Bearer {validJWTToken}"

------
### POST /api/realEstates
#### Function: 
Saves a RealEstate object
#### Headers: 
- Authorization: "Bearer {validJWTToken}"
- Content-Type: "application/json"
- Accept: "application/json"

#### Body
RealEstate object

------
## MediaFiles
------
### POST /api/mediaFiles
#### Function:
Creates a mediaFile object AND uploads an associated file.

#### Headers:
- Authorization: "Bearer {validJWTToken}"
#### Body:
in ***form-data***:
the following key-values need to be filled:
- mediaFile of type file: the file to upload
- realEstateId: the id of the realEstate object to associate the mediaFile with. This object must exists

#### permissions
- Authorized for users in group 'tenantUser' and above (that is currently 'tenantSuperUser')
- Upload for the tenant the user belongs to is allowed optionallyAuthorized
--------
### GET /api/mediaFiles

#### Function: 
Returns all mediaFiles of the tenant identified by the JwtToken

#### Headers: 

- Authorization: "Bearer {validJWTToken}"


## Permissions
- 1: Read
- 2: Modify
- 3: Delete

## Groups
- 1: Anonymous User
- 2: Individual User
- 3: Tenant User 
- 4: Tenant SuperUser


Example for mediaFile:

- A mediaFile is public ==> minimal required Group is **1: Anonymous User**
- A mediaFile is restricted to individual users 
  ==> minimal required Group is **2: Individual User**. If the user is part of this group an explicit permission is required. Groups 3 and 4 are permitted.
- A mediaFile is restricted to **3: Tenant User** ==> The user must be in group 3 or 4 

Each mediaFile got a minimal required group for each of the permissions:
- minGroupRead
- minGroupModify
- minGroupDelete