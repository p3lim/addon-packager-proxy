# Addon Packager Proxy

This is a tool designed to help authors of "addons" for the popular MMORPG "World of Warcraft" release their projects to both [Curse/CurseForge](http://www.curseforge.com/) and [WowInterface](http://wowinterface.com/community.php), the two most popular sites for hosting releases for such projects.

The tool (currently) has some very specific usage requirements:

- The user needs to use [Git](http://www.git-scm.com/).
- The user needs to push to both GitHub and CurseForge repositories.
- The user needs to use [Markdown](http://daringfireball.net/projects/markdown/) for changelogs.
  - Although changelogs are optional.

## How it works

This application is utilizing [GitHub webhooks](https://developer.github.com/webhooks/), [CurseForge's packager](http://www.curseforge.com/wiki/projects/packaging-an-addon/) and a [web application](http://nodejs.org/).

Here is a breakdown of how the entire process works:

1. The user commits his/her changes locally and creates tags, the tags are used as version numbers/strings.
2. The user pushes the commit(s) and tag(s) to GitHub.
3. GitHub recognizes the tag(s) created, sends off a webhook to the application.
4. The application notices the webhook and queues the application.
5. The user pushes the commit(s) and tag(s) to CurseForge.
6. After some time, the application starts querying CurseForge to see if the packager has finished making a zip.
7. The application then grabs the zip off CurseForge once it's ready.
8. The application authorizes and uploads the addon to WowInterface.

## How to install

First off you'll want to create a list of information about the addons you want the app to access.  
Please see [this wiki article]() about it, you will need it for the setup.

Click the purple deploy button below and follow the instructions on the screen.  
When it's done deploying, visit [the wiki](https://github.com/p3lim/addon-packager-proxy/wiki/Setup) to finish the setup.

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Legal

See [LICENSE.txt](https://github.com/p3lim/addon-packager-proxy/blob/master/LICENSE.txt).
