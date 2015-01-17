# Addon Packager Proxy

This is a tool designed to help authors of "addons" for the popular MMORPG "World of Warcraft" release their projects to both [Curse/CurseForge](http://www.curseforge.com/) and [WowInterface](http://wowinterface.com/community.php), the two most popular sites for hosting releases for such projects.

It fits to a very specific release schedule, and it has some requirements:

- The user needs to use [Git](http://www.git-scm.com/).
- The user needs to push to both GitHub and CurseForge repositories.
- Support for automatic changelogs is pretty bare, and requires them to be handled in several ways.
	- For one, the changelog has to be written in Markdown, following a very specific set of rules.

## How it works

This application is utilizing [GitHub webhooks](https://developer.github.com/webhooks/), [CurseForge's packager](http://www.curseforge.com/wiki/projects/packaging-an-addon/) and a web server.

1. The user commits his changes locally and creates tags, the tags are used as version numbers.
2. The user pushes the commit(s) and tag(s) to GitHub.
3. GitHub recognizes the tag(s) created, sends off a webhook to the application.
4. The application notices the webhook and the repository and starts querying CurseForge for any updates.
5. The user pushes the commit(s) and tag(s) to CurseForge.
6. The application then grabs the packaged addon off CurseForge once it's ready.
7. The application authorizes and uploads the addon to WowInterface.

## How to use

So, in order to make set this up, it doesn't require much knowledge in node.js or anything.

#### Step 1: GitHub

1. You must already have an account on GitHub, or create a new one [here](https://github.com/join).
2. [Fork](https://github.com/p3lim/addon-packager-proxy/fork) this repository to your own account on GitHub.
3. Edit the [addons.json](https://github.com/p3lim/addon-packager-proxy/blob/master/addons.json) file, filling in the specific details for your own addons:
  - `path` - The output file's name and directory, the same as "package-as" in a [.pkgmeta file](http://www.curseforge.com/wiki/projects/pkgmeta-file/#w-changing-the-package-name)
  - `repo` - The name of the repository on GitHub.
  - `curse` - The "slug" for the addon used on CurseForge, same as in the URLs and repository  
    (eg. "molinari" in `http://www.curse.com/addons/wow/molinari` or `git@git.curseforge.net:wow/molinari/mainline.git`)
  - `wowi` - The ID for the addon used on WowInterface, same as in the URLs  
    (eg. "13188" in `http://www.wowinterface.com/downloads/info13188-Molinari.html`)

#### Step 2: Web server

I will be using [Heroku](https://www.heroku.com/) for this, as they provide a free way to host simple web applications.  
You are free to use whatever, but I will only support Heroku.

1. Set up an account if you don't already have one, you can sign up [here](https://signup.heroku.com/www-home-top).
2. Head over to your [dashboard](https://dashboard.heroku.com/apps) and proceed to [create a new app](https://dashboard.heroku.com/new).
  - You can choose a name and region for it, but both can safely be left as-is.
3. We will be using "Connect to GitHub", although you can use the [Heroku Toolbelt](https://toolbelt.heroku.com/) if you'd like.
  1. Authenticate your application with GitHub.
  2. Manually deploy the master branch.
    - Optionally, you could enable automatic deploys, but be careful using that.

Once it's done building, we need to set up the config variables the application needs to work.

1. Go to the app settings, button on top.
2. Click the "Reveal Config Vars" button to start editing.
3. Add the following key-value pairs:
  - `GITHUB_SECRET` - Can be anything, treat it as a password
  - `WOWI_USERNAME` - Your username on WowInterface
  - `WOWI_PASSWORD` - Your password on WowInterface
4. Optionally, add any of the following key-value pairs:
  - `QUERY_MAX_ATTEMPTS` - Number of attempts to query CurseForge for the updated file (between 2 and 10, defaults to 3)
  - `QUERY_DELAY_SECONDS` - Number of seconds between each attempt to query CurseForge (between 30 and 300, defaults to 60)

And we're done!  
Take a note of the url to the application (link at the top of the page), as we will need it later.

#### Step 3: Webhooks

Visit GitHub again, this time we're going to initiate the whole thing.  

1. Either go to each and every repository, or a organization, then go to the settings.
2. On the left, hit Webhooks, then proceed to add one.
3. In `Payload URL`, enter the url for your app on Heroku.
4. In `Secret`, add the value you used for "GITHUB_SECRET" on Heroku.
5. Under `Which events would you like to trigger this webhook?`, select `Let me select individual events.`, then check off `Create`.
6. Make sure the `Active` checkbox is checked off, then click `Add webhook`.

And we're done!  
From now on, every time you push a tag to both GitHub and CurseForge, it'll take the packaged zip from CurseForge and upload it to WowInterface.

If you'd like to continue on, we're going to add support for changelogs.

#### Step 4: Changelogs (optional)

**Note**: The support for this is very bare, it currently only supports headers (\#\#) and lists (\-) from Markdown.  

Please see the changelog for [one of my addons](https://github.com/p3lim-wow/Molinari/blob/60000.35-Release/CHANGELOG.md) for examples.
I'm following the "rules" of [keepachangelog.com](http://keepachangelog.com/) very loosely.

Having a file called `CHANGELOGS.md` in the root directory following the "rules" is enough for the changelog on WowInterface, but you'd probably want to have the same for CurseForge as well.

1. Create a `.pkgmeta` file in the root directory of your addon.
2. Add the following bit of text to it:
```YAML
manual-changelog:
    filename: CHANGELOG.md
    markup-type: markdown
```

And that's it! To learn more about the `.pkgmeta` file and how to create it, see the [CurseForge Knowledge base](http://wow.curseforge.com/wiki/projects/pkgmeta-file/)

## Legal

See [LICENSE.txt](https://github.com/p3lim/addon-packager-proxy).
