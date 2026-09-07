#!/usr/bin/env bash
# Build, tag and push the storefront image.
#
# The NEXT_PUBLIC_* values are read from .env and passed as --build-arg
# because Next.js inlines them into the client bundle during `npm run build`.
# Setting them in docker-compose.yml's `environment:` is too late — by the
# time the container starts, the strings are already compiled into the JS.
#
# Build and push are one command (`--push`) on purpose: a separate
# `docker push` either races the build or, with a docker-container builder,
# uploads a stale image the build never wrote to the local store.
set -euo pipefail

cd "$(dirname "$0")"

IMAGE=exponentor/diva-frontend
TAG=$(date +%Y%m%d-%H%M)

if [ ! -f .env ]; then
  echo "error: .env not found — the NEXT_PUBLIC_* values live there." >&2
  exit 1
fi

# Read from .env without sourcing it, so a stray shell character in a value
# cannot execute.
read_env() {
  local value
  value=$(grep -E "^$1=" .env | head -1 | cut -d= -f2-)
  if [ -z "$value" ]; then
    echo "error: $1 is empty or missing in .env" >&2
    exit 1
  fi
  printf '%s' "$value"
}

CLOUDINARY=$(read_env NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
CHECKOUT=$(read_env NEXT_PUBLIC_CHECKOUT_ENABLED)
GOOGLE_ID=$(read_env NEXT_PUBLIC_GOOGLE_CLIENT_ID)

echo "Building $IMAGE:$TAG"
echo "  cloudinary : $CLOUDINARY"
echo "  checkout   : $CHECKOUT"
echo "  google id  : ${GOOGLE_ID%%-*}-…"

docker buildx build \
  --platform linux/amd64 \
  --build-arg "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$CLOUDINARY" \
  --build-arg "NEXT_PUBLIC_CHECKOUT_ENABLED=$CHECKOUT" \
  --build-arg "NEXT_PUBLIC_GOOGLE_CLIENT_ID=$GOOGLE_ID" \
  -t "$IMAGE:$TAG" \
  -t "$IMAGE:latest" \
  --push .

# Proves the client ID actually landed in the bundle, rather than trusting
# that the build args were wired up correctly.
echo "Verifying the client ID reached the bundle…"
if docker run --rm "$IMAGE:$TAG" \
     sh -c "grep -rq '${GOOGLE_ID%%-*}' .next/static"; then
  echo "  ok — NEXT_PUBLIC_GOOGLE_CLIENT_ID is in the client bundle"
else
  echo "  FAILED — the build args did not reach npm run build" >&2
  exit 1
fi

echo
echo "Pushed $IMAGE:$TAG (and :latest). On the server run:"
echo "  docker compose pull && docker compose up -d --force-recreate"
