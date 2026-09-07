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
  # .env is edited on Windows, so every line ends \r\n. Command substitution
  # strips the \n but keeps the \r, and a build arg of $'true\r' compiles to
  # the string "true\r" — which fails `=== "true"` and silently disables
  # checkout. Strip it, plus any stray surrounding whitespace and quotes.
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

# Proves the values actually landed in the bundle, rather than trusting that
# the build args were wired up correctly. Match the *whole* client id, not
# just its numeric prefix: a trailing \r from a CRLF .env still contains the
# prefix, so a prefix match would pass on a value Google rejects.
echo "Verifying the build args reached the bundle…"
fail=0

if docker run --rm "$IMAGE:$TAG" sh -c "grep -rqF '$GOOGLE_ID' .next/static"; then
  echo "  ok      NEXT_PUBLIC_GOOGLE_CLIENT_ID"
else
  echo "  FAILED  NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing or malformed" >&2
  fail=1
fi

# CHECKOUT_ENABLED cannot be checked by grepping .next/static: the sandbox
# route is a real page in app/, and the demo banner's text sits in an unused
# JSX branch, so both strings are in the bundle either way. The only reliable
# test is to boot the image and see which branch actually renders — which is
# what catches a "true\r" that reads as false.
if [ "$CHECKOUT" = "true" ]; then
  cid=$(docker run --rm -d -p 3199:3000 -e API_ORIGIN=http://unused "$IMAGE:$TAG")
  # The sleep below is load-bearing: without it these iterations burn through
  # in milliseconds while the server is still booting, and the check reports
  # "could not reach the container" on a perfectly good image.
  for _ in $(seq 1 30); do
    [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3199/checkout \
         --max-time 5 2>/dev/null)" = "200" ] && break
    sleep 1
  done
  page=$(curl -s --max-time 15 http://localhost:3199/checkout 2>/dev/null || true)
  docker stop "$cid" >/dev/null 2>&1 || true

  if [ -z "$page" ]; then
    echo "  WARN    could not reach the container to verify checkout" >&2
  elif printf '%s' "$page" | grep -qF 'front-end demo'; then
    echo "  FAILED  checkout still renders the demo banner (flag read as false)" >&2
    fail=1
  else
    echo "  ok      NEXT_PUBLIC_CHECKOUT_ENABLED=true"
  fi
fi

if [ "$fail" -ne 0 ]; then
  echo "Refusing to continue — fix the build args before deploying." >&2
  exit 1
fi

echo
echo "Pushed $IMAGE:$TAG (and :latest). On the server run:"
echo "  docker compose pull && docker compose up -d --force-recreate"
