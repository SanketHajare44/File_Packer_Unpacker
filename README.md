# File Packer Unpacker 

This wraps the original `packer.java` CLI tool in a proper web app:

- **backend/** — Spring Boot REST API. `POST /api/pack` accepts multiple files
  and returns a packed `.srh` archive, byte-for-byte identical in format to
  what the original `packer.java` produces (same `SRH3` magic number, same
  100-byte per-file header, same XOR key `0x11`).
- **frontend/** — React + Tailwind UI: drop a folder or files, see them
  queued, inspect the exact header bytes that will be written for any file,
  and pack + download the archive.
- **cli-reference/** — your original `packer.java` / `unpacker.java`, kept
  as-is. Archives produced by the web app can still be unpacked with the
  original `unpacker.java` CLI tool, since the format is unchanged.

## What's implemented

Both directions now work end-to-end in the browser:

- **Pack**: drop a folder/files → inspect the live hex-dump of each file's
  header → pack → download the `.srh` archive (with a persistent
  "download again" link in case the auto-download gets blocked).
- **Unpack**: drop a `.srh` archive → it's inspected immediately (names +
  sizes, no extraction yet) → unpack → download a `.zip` of the decoded
  files.

Archives are fully compatible with the original CLI tools in
`cli-reference/` in both directions.

## Running the backend

Requires JDK 17+ and Maven.

```bash
cd backend
mvn spring-boot:run
```

Starts on `http://localhost:8080`. Health check: `GET /api/health`.

### Running the tests

```bash
cd backend
mvn test
```

`PackerServiceTest` and `UnpackerServiceTest` cover: the magic number, the
exact 100-byte header layout, the XOR encoding, oversized-name rejection,
multi-file packing, a full pack → unpack round trip, and corrupt/truncated
archive handling.

## Running the frontend

Requires Node 18+.

```bash
cd frontend
npm install
cp .env.example .env   # points VITE_API_URL at the backend
npm run dev
```

Opens on `http://localhost:5173`. The backend's CORS config
(`CorsConfig.java`) already allows this origin.

## How packing works here

`PackerService.java` is a direct port of your `packer.java` loop:

1. Write the 4-byte `SRH3` magic number once, at the start of the archive.
2. For each file: write a 100-byte header of `"<name> <size>"` padded with
   spaces (not encrypted), then the file's bytes each XORed with `0x11`.

The frontend's `HexPreview` component recomputes that same 100-byte header
client-side (see `src/utils/format.js`) purely for display — it's a
hex-dump of exactly what the backend will write for the selected file,
so you can see the format in action before hitting pack.

## Notes / things you may want to extend

- **Folder upload**: the "choose folder" button uses the
  `webkitdirectory` attribute (Chrome/Edge support this; Firefox does not
  fully support folder selection via that attribute, so "choose files"
  is there as a fallback).
- **Large uploads**: `application.properties` currently caps requests at
  500MB total / 200MB per file — adjust if you need more.
- **Validation**: `PackerService` throws if a file name + size won't fit
  in the 100-byte header, matching the original format's hard limit.
- **Deployment**: no Docker/CI included yet — say the word if you want a
  Dockerfile for the backend or a Vercel/Netlify config for the frontend
  for your portfolio/resume link.
