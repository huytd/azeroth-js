# AzerothJS

AzerothJS is an open source blog engine running on static file servers such as Github Pages or any web hosting.

---

**Under construction:** Detailed tutorial will be updated later.

## Offline editing

```
node app.js
```

Post manager will run on http://localhost:3000

In this page you can select which post you want to publish, which to unpublish.

## Live preview

Go to: 

```
http://localhost:3000/preview?url=<folder-name>/<markdown-file>.md
```

For example:

```
http://localhost:3000/preview?url=posts/test-pad.md
```

## Generate post for static file serving

```
node generator.js
```

## Generate tags

To tag the post, put this line to the end of the markdown post:

```
--@TAGS: <tag-1>, <tag-2>
```

Run:

```
node tagindexer.js
```

## Comment feature

You need to have Firebase account and replace the information in `template.html` with your config.
