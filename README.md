# URL Historian

A Chrome extension that enables the collection of web browsing activities in real-time. It collects data from research participants who opt in to share their browsing history for research purposes. Collected data is securely stored and only accessible to the [CSMaP](https://csmapnyu.org/) research team. The extension is available in [chrome web store](https://support.google.com/chrome_webstore/answer/2664769?hl=en) and accessible via invitation only.

<p align="center">
  <img src="https://github.com/mginabluebox/URL-Historian-Chrome/blob/master/images/user_experience/active.jpg" width=400>
   <img src="https://github.com/mginabluebox/URL-Historian-Chrome/blob/master/images/user_experience/paused.jpg" width=400><br>
  <i>Active/Pause modes</i>
</p>

This web plug in is for research purposes by CSMaP. The package may not be maintained by the CSMaP team beyond the duration of the project. Additional support for use of this plug in may not be provided. 

# Installation
1. Install extension from chrome web store.
2. Once the extension is installed, a CSMaP icon ![icon](images/icon16.png) will appear in your browser's toolbar.

# Notification
* When the icon appears grey ![icon](images/icon_disabled_16.png), all activities in the extension are paused. After the extension is activated, the icon will appear in color ![icon](images/icon16.png). 
* The extension will send reminders after you pause the extension for 60 minutes. After the first reminder, it will send follow-ups in 6-hour intervals until reactivation. 

# Usage
### Login 
1. Enter your user ID in *User ID*.
2. Click on **Submit**. The extension will become active ![icon](images/icon16.png).
3. After 10 failed login attempts, you will be denied access to the extension's functionalities. You can contact our research team to recover your ID and regain access to the extension. 

### Pause/Activate the extension 
* Slide the toggle button to the left to pause ![icon](images/icon_disabled_16.png), or right to reactivate the extension ![icon](images/icon16.png).

### Blacklist websites
* Set up a list of domains that you prefer to keep private.
1. Add a website
* Enter a domain name in *Blacklist a website* in this format: www.paypal.com
* Click on **Add**. The website will be added to *Current Blacklisted Sites* (Default: www.example.com). When you visit any of these sites, we will not record the urls. 
2. Delete a blacklisted website
* Click on the red “x” next to a domain name. The website will be removed from *Current Blacklisted Sites*.

<p align="center">
  <img src="https://github.com/mginabluebox/URL-Historian-Chrome/blob/master/images/user_experience/blacklist.png"><br>
  <i>Add a website to the blacklist</i>
</p>

### Delete collected data
* Delete data collected under your user ID. You must log in first before proceeding.
* We currently allow data deletion within the past 7 days. (You can contact our research team to request data deletion beyond the 7-day time frame.)
1. Delete by date
   - Click on **by Date**.
   - Select the *TimeZone* you were in (Default: Eastern Time (US and Canada)). You can also search for a time zone using keywords (e.g. Eastern, -04). 
   - Select a date on which you wish to delete your browse activities.
   - Click on **Delete**. All your data collected on the selected date will be permanently deleted from our storage. 

<p align="center">
  <img src="https://github.com/mginabluebox/URL-Historian-Chrome/blob/master/images/user_experience/delete_by_date.png"><br>
  <i>Delete browse history by selecting a day from the past 7 days</i>
</p>

2. Delete by hour
   - Click on **by Time**.
   - Select the *TimeZone* you were in (Default: Eastern Time (US and Canada)). You can also search for a time zone using keywords (e.g. Eastern, -04). 
   - First, select a date on which you wish to delete your browse activities.
   - Then, 
     - select a *StartTime* (inclusive) and an *EndTime* (inclusive) to specify a hour range, **_OR_**
     - select a *Time* to specify a single hour.
   - You can reset all fields using the **Reset** button.
   - Click on **Delete**. All your data collected within the specified time frame will be permanently deleted from our storage. 

<p align="center">
  <img src="https://github.com/mginabluebox/URL-Historian-Chrome/blob/master/images/user_experience/delete_by_time.png"><br>
  <i>Delete browse history by selecting a time range or an hour in the past 7 days</i>
</p>

### Spanish localization
The extension supports Spanish localization. While in the English version (default), click on **Español** to use the Spanish verion. Click on **English** to switch back to the English version.


# CREDITS
Created by 
* [Edwin Kamau](https://github.com/kamau-edwin)
* [Charlotte Ji](https://github.com/mginabluebox)
* [Iva Porfirova](https://github.com/ivaPorfirova) 
* [Riya Mokashi](https://github.com/RiyaMokashi) 
* [Ledion Lecaj](https://github.com/LedionLecaj)
