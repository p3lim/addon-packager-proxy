# Addon Packager Proxy

This is a tool designed to help authors of "addons" for the popular MMORPG "World of Warcraft" release their projects to both [Curse/CurseForge](//www.curseforge.com/) and [WowInterface](//wowinterface.com/community.php), the two most popular sites for hosting releases for such projects.

The tool (currently) has some very specific usage requirements:

- The user needs to use [Git](//www.git-scm.com/).
- The user needs to push to both GitHub and CurseForge repositories.
- The user needs to use [Markdown](http://daringfireball.net/projects/markdown/) for changelogs.
  - Although changelogs are optional.

## How it works

This application is utilizing [GitHub webhooks](//developer.github.com/webhooks/), [CurseForge's packager](//wow.curseforge.com/wiki/projects/packaging-an-addon/) and a [web application](//nodejs.org/en/).

Here is a breakdown of how the entire process works:

1. The user commits his/her changes locally and creates tags, the tags are used as version numbers/strings.
2. The user pushes the commit(s) and tag(s) to GitHub.
3. GitHub recognizes the tag(s) created, sends off a webhook to the application.
4. The application notices the webhook and queues the addon.
5. The user pushes the commit(s) and tag(s) to CurseForge.
6. After some time, the application starts querying CurseForge to see if the packager has finished making a zip.
7. The application then grabs the zip off CurseForge once it's ready.
8. The application authorizes and uploads the addon to WowInterface.

## How to install

First off you'll want to create a list of information about the addons you want the app to access.  
Please see [this wiki article](//github.com/p3lim/addon-packager-proxy/wiki/AddonList) about it, you will need it for the setup.

Click the purple deploy button below and follow the instructions on the screen.  
When it's done deploying, visit [the wiki](//github.com/p3lim/addon-packager-proxy/wiki/Setup) to finish the setup.

[![Deploy to Heroku](//www.herokucdn.com/deploy/button.png)](//heroku.com/deploy)

## Legal

See [LICENSE.txt](//github.com/p3lim/addon-packager-proxy/blob/master/LICENSE.txt).
