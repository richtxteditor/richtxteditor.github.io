---
layout: post
title: "From Broken Builds to Live Portfolio: A Jekyll & al-folio Journey"
date: 2025-08-22 10:30:00
description: Documenting the final hurdles of deploying my portfolio, from cryptic errors and giscus configurations to fixing a CI/CD pipeline.
tags: Jekyll, GitHub Pages, al-folio, giscus, CI/CD, Portfolio
categories: portfolio-posts
featured: true
---

After weeks of tinkering, tweaking, and wrestling with error logs, I’m incredibly excited to announce that my new portfolio is finally stable and live! Built with the powerful combination of Jekyll and the beautiful [al-folio theme](https://github.com/alshedivat/al-folio), and hosted on GitHub Pages, this project was both a rewarding and humbling experience.

Every developer knows that "one last thing" is never actually the last thing. This post is a look behind the curtain at the final 10% of the work that took 90% of the time—a journey through cryptic errors, configuration puzzles, and the silent-but-deadly failed CI/CD pipeline. This post will walk through some of those technical hurdles with code snippets, just like the al-folio theme allows.

### The First Stumble: The Classic "File Not Found"

My journey began with an error that every developer, junior or senior, has shamefully faced. After trying to replace the default profile picture, my build process came to a screeching halt with a familiar message:

```bash
Liquid Exception: No such file or directory @ rb_sysopen - assets/img/prof_pic.jpg
```

It was a simple, infuriating pathing issue. I had gotten so turned around that at one point I had to look up the developer's question of last resort: "How can I just burn it all down and reset my local repository to match the remote?" For the record, these are the magic commands:

```bash
# First, fetch the latest state of the remote
git fetch origin

# Reset your local branch to match the remote, discarding all local changes
git reset --hard origin/main

# Clean up any new, untracked files and directories
git clean -f -d
```

It was a humbling reminder: always check the simple stuff first.

### Taming the Comments: A Deep Dive into Giscus

With the build finally passing, I moved on to integrating a comment system. I chose giscus, a fantastic, privacy-friendly system that uses GitHub Discussions as a backend. Naturally, it didn't work on the first try.

```
giscus comments misconfigured > Please follow instructions...
```

This error sent me down the rabbit hole of configuration. The fix involved several key steps that I hope can help others using the al-folio theme.

First, I added the giscus configuration to my \_config.yml for a clean, centralized setup:

```yaml
# _config.yml
giscus:
  repo: "richtxteditor/richtxteditor.github.io"
  repo_id: "R_kgDOPinJNQ"
  category_id: "DIC_kwDOPinJNc4Cufx7"
  mapping: "pathname"
  strict: "0"
  reactions_enabled: "1"
  emit_metadata: "1"
  input_position: "top"
  theme: "preferred_color_scheme"
  lang: "en"
  loading: "lazy"
```

Next, to enable comments on all blog posts and projects without manually editing every file, I used Jekyll's defaults feature. This is a powerful way to apply front matter to entire folders or collections automatically.

```yaml
# _config.yml
defaults:
  # Automatically enable comments for all blog posts
  - scope:
      path: "_posts"
      type: "posts"
    values:
      giscus_comments: true
  # Automatically enable comments for all projects
  - scope:
      path: "_projects"
      type: "projects"
    values:
      giscus_comments: true
```

With this, giscus was finally integrated, automated, and maintainable.

### The Final Boss: A Single Broken Link in a CI/CD Pipeline

The site was working locally. The code was clean. I pushed my changes, feeling triumphant, only to see the dreaded red 'X' next to my commit. The GitHub Action had failed. The culprit was lycheeverse/lychee-action, a link checker.

The log was a firehose of information, but buried at the very bottom was the golden ticket:

```
### Errors in _site/cv/index.html
* [ERR] file:///.../_site/cv/richtxteditor.github.io | Failed: Cannot find file
```

The action was failing because of a single broken link on my CV page. My layout file, \_layouts/cv.liquid, was trying to build a path to my resume PDF but was doing it incorrectly. After ensuring my resume.pdf was correctly placed in /assets/pdf/, I confirmed the layout code was using the proper Jekyll filters to generate the correct link:

```liquid
{% raw %}
<!-- _layouts/cv.liquid -->
href="{{ page.cv_pdf | prepend: 'assets/pdf/' | relative_url }}"
{% endraw %}
```

### Beyond the Code: Crafting the Narrative

This stabilization process wasn't just about fixing bugs; it was about polishing the content. I spent time refining my "About Me" section, weaving together my unconventional background in Media Arts and Film with my technical expertise in software engineering. Telling that story felt just as important as fixing a broken link.

This portfolio is the result of that journey—a blend of creative storytelling and technical problem-solving. Feel free to explore my projects and blog posts, and of course, leave a comment below using the very system I just wrestled into submission.
