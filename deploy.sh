#!/usr/bin/env bash
# Build, tag and push the storefront image.
#
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is read from .env and passed as --build-arg
# because Next.js inlines it into the client bundle during `npm run build`.
# Setting it in docker-compose.yml's `environment:` is too late — by the time
# the container starts, the string is already compiled into the JS.
#
# The Google client id is hardcoded in components/auth/google-button.tsx and
# checkout always uses the real PhonePe flow, so neither depends on this script.
#
# Build and push are one command (`--push`) on purpose: a separate
# `docker push` either races the build or, with a docker-container builder,
# uploads a stale image the build never wrote to the local store.
set -euo pipefail

cd "$(dirname "$0")"

IMAGE=exponentor/diva-frontend
TAG=$(date +%Y%m%d-%H%M)

if [ ! -f .env ]; then
  echo "error: .env not found — NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME lives there." >&2
  exit 1
fi

# Read from .env without sourcing it, so a stray shell character in a value
# cannot execute.
read_env() {
  local value
  value=$(grep -E "^$1=" .env | head -1 | cut -d= -f2-)
  # .env may be edited on Windows, so lines can end \r\n. Command substitution
  # strips the \n but keeps the \r. Strip it, plus any stray surrounding
  # whitespace and quotes.
  value=${value%$'\r'}
  value=${value#"${value%%[![:space:]]*}"}
  value=${value%"${value##*[![:space:]]}"}
  value=${value%\"}; value=${value#\"}
  value=${value%\'}; value=${value#\'}
  if [ -z "$value" ]; then
    echo "error: $1 is empty or missing in .env" >&2
    exit 1
  fi
  printf '%s' "$value"
}

CLOUDINARY=$(read_env NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)

echo "Building $IMAGE:$TAG"
echo "  cloudinary : $CLOUDINARY"

docker buildx build \
  --platform linux/amd64 \
  --build-arg "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$CLOUDINARY" \
  -t "$IMAGE:$TAG" \
  -t "$IMAGE:latest" \
  --push .

echo
echo "Pushed $IMAGE:$TAG (and :latest). On the server run:"
echo "  docker compose pull && docker compose up -d --force-recreate"
