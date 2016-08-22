##WARNING
This script was made as my first ever Javascript project. As such, it is both bad, and broken. Right now, the feature that stops you botting at certain times does NOT work, which caused me to be banned. Oh well.

# WHAT IS
A very simple botcheck bot for the text based game, Syrnia. Developed in June 2015 as a learning experiment for JavaScript.
## HOW MADE
This is a Tampermonkey/Greasemonkey script, written primarily in JavaScript. It was my first JavaScript project and has not really been updated since. It is being released on GitHub as a learning tool for others.
## WHAT DO
* Periodically checks for botchecks, if it finds them it uploads them to 2captcha, awaits the result, and then enters the result into the input field.
* Logs you in if you get logged out.
* Gives some rudimentary details on the work page.
* Can be configured to only work during certain times of the day.
* Will attempt to do the main action for that page, such as digging. (WIP, unsure if I will ever come back to this project)

## HOW DO

* Replace stopTime and startTime with your preferred running times. Times are based on system times.
```javascript
var stopTime = 0; //Stops at midnight
var startTime = 4; //Starts at 4am
```
* Replace username and password with your own if you wish the auto-login to work.
* You will need an account and credit on 2captcha.com, and you can replace the apikey variable with your captcha key from the site.
* Simply install with Greasemonkey or Tampermonkey, then browse to the Syrnia homepage.

## ADVANCED
The bot _currently_ will only run completely autonomously doing one thing at a time. You'll notice on line 221, there is
```javascript
locationText('work', 'fishing', 'Small fishing boat'); //Temporary until we get an array going
```
This will need changing to make it completely automatic for continuous days.
* First, go to your desired AFK location.
* Where it says your action (For example, "Dig using your spade" or "Fish with your small fishingboat"), right click on it and click "Inspect Element". It will look something like this:

```html
<a href onclick="locationText('work', 'other');return false;">Dig using your spade</a>
```
In this case, the interesting bit is `locationText('work', 'other');`
Replace the line in the script with that piece of Javascript. Refresh Syrnia, and it should work fairly autonomously from then on.

## TESTING
* I have ran this script continuously with no input doing fishing for approximately 30 days. It does work, but of course, is still in beta, and there may be bugs. Please report them.
