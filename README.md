# XVIDSHUB PUBLIC

Static public frontend for XVIDSHUB.

## Features
- REST API URL configuration stored locally in the browser
- Video and topic search
- Topic/category chips
- Dedicated watch/streaming page using `#watch/{id}`
- Persistent lazy thumbnails from `/api/v1/public/thumbnail/{id}`
- Like/view actions through the existing REST API
- Related videos, share, copy link and download actions
- Responsive header/footer

## Thumbnail architecture
The public site does **not** render video frames. Thumbnail generation is performed by the REST API/admin and the resulting JPEG is stored in Telegram. The public site only requests the persistent thumbnail endpoint.

## Deploy
Deploy the repository as a static site. Enter the existing REST API URL using the gear button in the header.

No Telegram bot token or private API secret belongs in this repository.
