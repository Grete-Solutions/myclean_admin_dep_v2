'use client'
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription,  CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs as BaseTabs, TabsContent as BaseTabsContent, TabsList as BaseTabsList, TabsTrigger as BaseTabsTrigger } from '@/components/ui/tabs';



type Settings = {
  driverWalletMinAmount?: string;
  userWalletMinAmount?: string;
  driverSearchRadius?: string;
  userScheduleRideMinutes?: string;
  minTimeForScheduledRides?: string;
  maxTimeForRegularRides?: string;
  driverAcceptRejectDuration?: string;
  driverEnableRouteBooking?: string;
  navbarColor?: string;
  sideBarColor?: string;
  sideBarTextColor?: string;
  appName?: string;
  currencyCode?: string;
  currencySymbol?: string;
  defaultCountryCode?: string;
  contactUsMobile?: string;
  contactUsLink?: string;
  showWalletFeature?: string;
  userReferralCommission?: string;
  driverReferralCommission?: string;
  googleMapKeyWeb?: string;
  googleMapKeyDistance?: string;
  googleSheetId?: string;
  defaultLatitude?: string;
  defaultLongitude?: string;
  enableVASEMap?: string;
};

export default function Tabs() {
  const [walletSettings, setWalletSettings] = useState<Settings>({
    driverWalletMinAmount: '',
    userWalletMinAmount: '',
  });

  const [tripSettings, setTripSettings] = useState<Settings>({
    driverSearchRadius: '',
    userScheduleRideMinutes: '',
    minTimeForScheduledRides: '',
    maxTimeForRegularRides: '',
    driverAcceptRejectDuration: '',
    driverEnableRouteBooking: '',
  });

  const [appSettings, setAppSettings] = useState<Settings>({
    navbarColor: '',
    sideBarColor: '',
    sideBarTextColor: '',
    appName: '',
    currencyCode: '',
    currencySymbol: '',
    defaultCountryCode: '',
    contactUsMobile: '',
    contactUsLink: '',
    showWalletFeature: '',
  });

  const [referralSettings, setReferralSettings] = useState<Settings>({
    userReferralCommission: '',
    driverReferralCommission: '',
  });

  const [mapSettings, setMapSettings] = useState<Settings>({
    googleMapKeyWeb: '',
    googleMapKeyDistance: '',
    googleSheetId: '',
    defaultLatitude: '',
    defaultLongitude: '',
    enableVASEMap: '',
  });

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  // const {toast}= useToast()
  const handleSave = async (settingName: string, settingValue: number, settingType: string) => {
    const settingData = {
      settingName,
      settingValue,
      settingType,
    };

    try {
      const response = await fetch('/lib/POST/postsystemsettings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingData),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }
        // toast({title:'Success', description:'Sucessfully saved changes'});
          } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    settings: Settings,
    setSettings: React.Dispatch<React.SetStateAction<Settings>>,
  ) => {
    const { id, value } = e.target;
    const numericValue = Number(value);

    if (isNaN(numericValue)) {
      alert('Please enter a valid number');
      return;
    }

    setSettings(prevSettings => ({
      ...prevSettings,
      [id]: numericValue.toString(), 
    }));

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      handleSave(id, numericValue, 'number');
    }, 500);
  };

  return (
    <BaseTabs defaultValue="WalletSettings" className="w-full h-full">
      <BaseTabsList className="grid grid-cols-5 h-fit max-lg:grid-cols-3 w-full">
        <BaseTabsTrigger value="WalletSettings">Wallet Settings</BaseTabsTrigger>
        <BaseTabsTrigger value="TripSettings">Trip Settings</BaseTabsTrigger>
        <BaseTabsTrigger value="AppSettings">App Settings</BaseTabsTrigger>
        <BaseTabsTrigger value="Referral">Referral</BaseTabsTrigger>
        <BaseTabsTrigger value="MapSettings">Map Settings</BaseTabsTrigger>
      </BaseTabsList>

      {/* Wallet Settings */}
      <BaseTabsContent value="WalletSettings">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Settings</CardTitle>
            <CardDescription>
              Make changes to your wallet here. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="driverWalletMinAmount">Driver Wallet Minimum Amount To Get An Order</Label>
              <Input
                id="driverWalletMinAmount"
                placeholder="1"
                value={walletSettings.driverWalletMinAmount}
                onChange={(e) => handleInputChange(e, walletSettings, setWalletSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="userWalletMinAmount">User Wallet Minimum Amount To Place An Order</Label>
              <Input
                id="userWalletMinAmount"
                placeholder="1"
                value={walletSettings.userWalletMinAmount}
                onChange={(e) => handleInputChange(e, walletSettings, setWalletSettings)}
              />
            </div>
          </CardContent>
        </Card>
      </BaseTabsContent>

      {/* Trip Settings */}
      <BaseTabsContent value="TripSettings">
        <Card>
          <CardHeader>
            <CardTitle>Trip Settings</CardTitle>
            <CardDescription>
              Make changes to your trip here. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="driverSearchRadius">Driver Search radius in Kilometer</Label>
              <Input
                id="driverSearchRadius"
                placeholder="0"
                value={tripSettings.driverSearchRadius}
                onChange={(e) => handleInputChange(e, tripSettings, setTripSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="userScheduleRideMinutes">User Can Schedule A Ride After X minutes</Label>
              <Input
                id="userScheduleRideMinutes"
                placeholder="1"
                value={tripSettings.userScheduleRideMinutes}
                onChange={(e) => handleInputChange(e, tripSettings, setTripSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="minTimeForScheduledRides">Minimum time for find drivers for schedule rides in minutes</Label>
              <Input
                id="minTimeForScheduledRides"
                placeholder="1"
                value={tripSettings.minTimeForScheduledRides}
                onChange={(e) => handleInputChange(e, tripSettings, setTripSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxTimeForRegularRides">Maximum Time For Find Drivers For Regular Ride</Label>
              <Input
                id="maxTimeForRegularRides"
                placeholder="1"
                value={tripSettings.maxTimeForRegularRides}
                onChange={(e) => handleInputChange(e, tripSettings, setTripSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="driverAcceptRejectDuration">Trip Accept/Reject Duration For Driver in seconds</Label>
              <Input
                id="driverAcceptRejectDuration"
                placeholder="1"
                value={tripSettings.driverAcceptRejectDuration}
                onChange={(e) => handleInputChange(e, tripSettings, setTripSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="driverEnableRouteBooking">Driver Enable Route Booking</Label>
              <Input
                id="driverEnableRouteBooking"
                placeholder="1"
                value={tripSettings.driverEnableRouteBooking}
                onChange={(e) => handleInputChange(e, tripSettings, setTripSettings)}
              />
            </div>
          </CardContent>
        </Card>
      </BaseTabsContent>

      {/* App Settings */}
      <BaseTabsContent value="AppSettings">
        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
            <CardDescription>
              Make changes to your app here. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="navbarColor">NavBar Color</Label>
              <Input
                id="navbarColor"
                placeholder="#f7f7f7"
                value={appSettings.navbarColor}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sideBarColor">SideBar Color</Label>
              <Input
                id="sideBarColor"
                placeholder="#f7f7f7"
                value={appSettings.sideBarColor}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sideBarTextColor">SideBar Text Color</Label>
              <Input
                id="sideBarTextColor"
                placeholder="#f7f7f7"
                value={appSettings.sideBarTextColor}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                placeholder="App Name"
                value={appSettings.appName}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="currencyCode">Currency Code</Label>
              <Input
                id="currencyCode"
                placeholder="USD"
                value={appSettings.currencyCode}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="currencySymbol">Currency Symbol</Label>
              <Input
                id="currencySymbol"
                placeholder="$"
                value={appSettings.currencySymbol}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="defaultCountryCode">Default Country Code</Label>
              <Input
                id="defaultCountryCode"
                placeholder="US"
                value={appSettings.defaultCountryCode}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contactUsMobile">Contact Us Mobile Number</Label>
              <Input
                id="contactUsMobile"
                placeholder="123456789"
                value={appSettings.contactUsMobile}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contactUsLink">Contact Us Page Link</Label>
              <Input
                id="contactUsLink"
                placeholder="http://contact.us"
                value={appSettings.contactUsLink}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="showWalletFeature">Show Wallet Feature</Label>
              <Input
                id="showWalletFeature"
                placeholder="yes"
                value={appSettings.showWalletFeature}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings)}
              />
            </div>
          </CardContent>
        </Card>
      </BaseTabsContent>

      {/* Referral Settings */}
      <BaseTabsContent value="Referral">
        <Card>
          <CardHeader>
            <CardTitle>Referral Settings</CardTitle>
            <CardDescription>
              Make changes to your referral here. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="userReferralCommission">User Referral Commission (in percentage)</Label>
              <Input
                id="userReferralCommission"
                placeholder="1"
                value={referralSettings.userReferralCommission}
                onChange={(e) => handleInputChange(e, referralSettings, setReferralSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="driverReferralCommission">Driver Referral Commission (in percentage)</Label>
              <Input
                id="driverReferralCommission"
                placeholder="1"
                value={referralSettings.driverReferralCommission}
                onChange={(e) => handleInputChange(e, referralSettings, setReferralSettings)}
              />
            </div>
          </CardContent>
        </Card>
      </BaseTabsContent>

      {/* Map Settings */}
      <BaseTabsContent value="MapSettings">
        <Card>
          <CardHeader>
            <CardTitle>Map Settings</CardTitle>
            <CardDescription>
              Make changes to your map here. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="googleMapKeyWeb">Google Map Key (web)</Label>
              <Input
                id="googleMapKeyWeb"
                placeholder="key"
                value={mapSettings.googleMapKeyWeb}
                onChange={(e) => handleInputChange(e, mapSettings, setMapSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="googleMapKeyDistance">Google Map Key (distance)</Label>
              <Input
                id="googleMapKeyDistance"
                placeholder="key"
                value={mapSettings.googleMapKeyDistance}
                onChange={(e) => handleInputChange(e, mapSettings, setMapSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="googleSheetId">Google Sheet ID</Label>
              <Input
                id="googleSheetId"
                placeholder="id"
                value={mapSettings.googleSheetId}
                onChange={(e) => handleInputChange(e, mapSettings, setMapSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="defaultLatitude">Default Latitude</Label>
              <Input
                id="defaultLatitude"
                placeholder="0.0"
                value={mapSettings.defaultLatitude}
                onChange={(e) => handleInputChange(e, mapSettings, setMapSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="defaultLongitude">Default Longitude</Label>
              <Input
                id="defaultLongitude"
                placeholder="0.0"
                value={mapSettings.defaultLongitude}
                onChange={(e) => handleInputChange(e, mapSettings, setMapSettings)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="enableVASEMap">Enable VASE Map</Label>
              <Input
                id="enableVASEMap"
                placeholder="yes"
                value={mapSettings.enableVASEMap}
                onChange={(e) => handleInputChange(e, mapSettings, setMapSettings)}
              />
            </div>
          </CardContent>
        </Card>
      </BaseTabsContent>
    </BaseTabs>
  );
}
