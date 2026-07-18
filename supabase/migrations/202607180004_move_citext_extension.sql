-- Keep extension-owned types outside the public API schema.

alter extension citext set schema extensions;
