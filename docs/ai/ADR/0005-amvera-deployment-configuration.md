# ADR 0005: Amvera.ru Deployment Configuration & Persistent Storage

## Status
Accepted

## Context
As we plan to deploy the Train Keeper application to the cloud hosting platform `amvera.ru`, we must address the stateless nature of containerized environments. By default, Amvera containers are rebuilt and restarted dynamically, erasing any files generated in the application directory. 

Since Train Keeper uses LowDB (a local JSON-based file database), storing `history.json` directly in the application's root directory would result in total data loss upon any redeployment, restart, or scaling event.

We need a way to build and run the application on Amvera and ensure database persistence.

## Decision
1. **Amvera Config File (`amvera.yml`)**: We created an `amvera.yml` configuration file in the project root to declare a Node.js 20 environment, start the server using `server.js`, and route HTTP traffic through container port `3000`.
2. **Dynamic DB Path Resolution**: We updated `server.js` to dynamically detect if the persistent mount directory `/data` exists. If `/data` is present (which is the default mount path on Amvera), the production database `history.json` is saved there.
3. **Database Migration Strategy**: To initialize the database, users must manually upload their existing `history.json` using the Amvera web interface (Repository -> Data) rather than committing it to Git, protecting user privacy and preventing accidental data overwrites on subsequent commits.

## Consequences
- **Pros**:
    - Complete persistence of workout history and custom workout templates on Amvera across deployments and restarts.
    - Zero modification to local development workflows; the database continues to write to the local directory when `/data` is not present.
    - Enhanced data security and backup capabilities provided by Amvera's three-way replica storage in `/data`.
- **Cons**:
    - Relies on Amvera's default persistent volume mount point at `/data`. If changed, the application's environment variables or code must be updated.
