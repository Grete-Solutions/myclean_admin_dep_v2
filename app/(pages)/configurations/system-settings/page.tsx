'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X } from 'lucide-react';

// Types for different setting values
type BinItem = {
  binType: string;
  capacity: number;
  price: number;
  equivalentBags: string;
  isActive: boolean;
  imageUrl: string;
};

type SettingValue = string | number | BinItem[];

type Setting = {
  settingName: string;
  settingValue: SettingValue;
  settingType: 'string' | 'number' | 'float' | 'json';
};

// Individual setting group types
type WalletSettings = {
  wallet_minimum_amount: string;
};

type BinSettings = {
  bins: BinItem[];
};

type TripSettings = {
  driver_search_radius: string;
  user_scheduled_ride_minutes: string;
  min_time_for_scheduled_rides: string;
  max_time_for_regular_rides: string;
  driver_accept_rejection_duration: string;
  driver_enabled_ride_booking: string;
};

type AppSettings = {
  navbar_color: string;
  sidebar_color: string;
  sideBar_text_color: string;
  app_name: string;
  currency_code: string;
  currency_symbol: string;
  default_country_code: string;
  contact_us_mobile: string;
  contact_us_link: string;
  show_wallet_feature: string;
};

type ReferralSettings = {
  user_referral_comission: string;
  driver_referral_comission: string;
};

type MapSettings = {
  google_map_key: string;
  google_map_key_distance: string;
  google_sheet_id: string;
  default_latitude: string;
  default_longitude: string;
  enable_vase_map: string;
};

export default function SettingsTabs() {
  const [walletSettings, setWalletSettings] = useState<WalletSettings>({
    wallet_minimum_amount: '',
  });

  const [binSettings, setBinSettings] = useState<BinSettings>({
    bins: []
  });

  const [tripSettings, setTripSettings] = useState<TripSettings>({
    driver_search_radius: '',
    user_scheduled_ride_minutes: '',
    min_time_for_scheduled_rides: '',
    max_time_for_regular_rides: '',
    driver_accept_rejection_duration: '',
    driver_enabled_ride_booking: '',
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    navbar_color: '',
    sidebar_color: '',
    sideBar_text_color: '',
    app_name: '',
    currency_code: '',
    currency_symbol: '',
    default_country_code: '',
    contact_us_mobile: '',
    contact_us_link: '',
    show_wallet_feature: '',
  });

  const [referralSettings, setReferralSettings] = useState<ReferralSettings>({
    user_referral_comission: '',
    driver_referral_comission: '',
  });

  const [mapSettings, setMapSettings] = useState<MapSettings>({
    google_map_key: '',
    google_map_key_distance: '',
    google_sheet_id: '',
    default_latitude: '',
    default_longitude: '',
    enable_vase_map: '',
  });

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Determine setting type based on value
  const determineSettingType = (value: SettingValue): Setting['settingType'] => {
    if (Array.isArray(value)) {
      return 'json';
    }
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'number' : 'float';
    }
    return 'string';
  };

  const handleSave = async (settingName: string, settingValue: SettingValue) => {
    const settingType = determineSettingType(settingValue);
    
    const settingData: Setting = {
      settingName,
      settingValue,
      settingType,
    };

    try {
      const response = await fetch('/api/POST/postSystem-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingData),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }
      console.log('Successfully saved changes');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes');
    }
  };

  // Generic handleInputChange function
  const handleInputChange = <T extends Record<string, any>>(
    e: React.ChangeEvent<HTMLInputElement>,
    settings: T,
    setSettings: React.Dispatch<React.SetStateAction<T>>,
    expectedType: 'string' | 'number' | 'float' = 'number'
  ) => {
    const { id, value } = e.target;
    
    let processedValue: SettingValue = value;
    
    if (expectedType === 'number' || expectedType === 'float') {
      const numericValue = expectedType === 'number' ? parseInt(value, 10) : parseFloat(value);
      
      if (isNaN(numericValue)) {
        alert('Please enter a valid number');
        return;
      }
      processedValue = numericValue;
    }

    setSettings(prevSettings => ({
      ...prevSettings,
      [id]: expectedType === 'string' ? value : processedValue.toString(),
    }));

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      handleSave(id, processedValue);
    }, 500);
  };

  const handleBinItemChange = (index: number, field: keyof BinItem, value: string | number | boolean) => {
    setBinSettings(prevSettings => ({
      ...prevSettings,
      bins: prevSettings.bins.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        handleBinItemChange(index, 'imageUrl', result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    handleBinItemChange(index, 'imageUrl', '');
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };

  const addBinItem = () => {
    setBinSettings(prevSettings => ({
      ...prevSettings,
      bins: [...prevSettings.bins, {
        binType: '',
        capacity: 0,
        price: 0,
        equivalentBags: '',
        isActive: true,
        imageUrl: ''
      }]
    }));
  };

  const removeBinItem = (index: number) => {
    setBinSettings(prevSettings => ({
      ...prevSettings,
      bins: prevSettings.bins.filter((_, i) => i !== index)
    }));
    // Clean up file input ref
    delete fileInputRefs.current[index];
  };

  const saveBinSettings = () => {
    handleSave('bins', binSettings.bins);
  };

  return (
    <Tabs defaultValue="WalletSettings" className="w-full h-full">
      <TabsList className="grid grid-cols-6 h-fit max-lg:grid-cols-3 w-full">
        <TabsTrigger value="WalletSettings">Wallet Settings</TabsTrigger>
        <TabsTrigger value="TripSettings">Trip Settings</TabsTrigger>
        <TabsTrigger value="AppSettings">App Settings</TabsTrigger>
        <TabsTrigger value="Referral">Referral</TabsTrigger>
        <TabsTrigger value="MapSettings">Map Settings</TabsTrigger>
        <TabsTrigger value="BinSettings">Bin Settings</TabsTrigger>
      </TabsList>

      {/* Wallet Settings */}
      <TabsContent value="WalletSettings">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Settings</CardTitle>
            <CardDescription>
              Make changes to your wallet here. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="wallet_minimum_amount">Minimum Amount To Get An Order</Label>
              <Input
                id="wallet_minimum_amount"
                placeholder="1"
                value={walletSettings.wallet_minimum_amount}
                onChange={(e) => handleInputChange(e, walletSettings, setWalletSettings, 'number')}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Trip Settings */}
      <TabsContent value="TripSettings">
        <Card>
          <CardHeader>
            <CardTitle>Trip Settings</CardTitle>
            <CardDescription>
              Make changes to your trip here. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="driver_search_radius">Driver Search radius in Kilometer</Label>
              <Input
                id="driver_search_radius"
                placeholder="0"
                value={tripSettings.driver_search_radius}
                onChange={(e) => handleInputChange(e, tripSettings, setTripSettings, 'float')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="user_scheduled_ride_minutes">User Can Schedule A Ride After X minutes</Label>
              <Input
                id="user_scheduled_ride_minutes"
                placeholder="1"
                value={tripSettings.user_scheduled_ride_minutes}
                onChange={(e) => handleInputChange(e, tripSettings, setTripSettings, 'number')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="min_time_for_scheduled_rides">Minimum time for find drivers for schedule rides in minutes</Label>
              <Input
                id="min_time_for_scheduled_rides"
                placeholder="1"
                value={tripSettings.min_time_for_scheduled_rides}
                onChange={(e) => handleInputChange(e, tripSettings, setTripSettings, 'number')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="max_time_for_regular_rides">Maximum Time For Find Drivers For Regular Ride</Label>
              <Input
                id="max_time_for_regular_rides"
                placeholder="1"
                value={tripSettings.max_time_for_regular_rides}
                onChange={(e) => handleInputChange(e, tripSettings, setTripSettings, 'number')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="driver_accept_rejection_duration">Trip Accept/Reject Duration For Driver in seconds</Label>
              <Input
                id="driver_accept_rejection_duration"
                placeholder="1"
                value={tripSettings.driver_accept_rejection_duration}
                onChange={(e) => handleInputChange(e, tripSettings, setTripSettings, 'number')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="driver_enabled_ride_booking">Driver Enable Route Booking</Label>
              <Input
                id="driver_enabled_ride_booking"
                placeholder="1"
                value={tripSettings.driver_enabled_ride_booking}
                onChange={(e) => handleInputChange(e, tripSettings, setTripSettings, 'number')}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* App Settings */}
      <TabsContent value="AppSettings">
        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
            <CardDescription>
              Make changes to your app here. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="navbar_color">NavBar Color</Label>
              <Input
                id="navbar_color"
                placeholder="#f7f7f7"
                value={appSettings.navbar_color}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings, 'string')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sidebar_color">SideBar Color</Label>
              <Input
                id="sidebar_color"
                placeholder="#f7f7f7"
                value={appSettings.sidebar_color}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings, 'string')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sideBar_text_color">SideBar Text Color</Label>
              <Input
                id="sideBar_text_color"
                placeholder="#f7f7f7"
                value={appSettings.sideBar_text_color}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings, 'string')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="app_name">App Name</Label>
              <Input
                id="app_name"
                placeholder="App Name"
                value={appSettings.app_name}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings, 'string')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="currency_code">Currency Code</Label>
              <Input
                id="currency_code"
                placeholder="USD"
                value={appSettings.currency_code}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings, 'string')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="currency_symbol">Currency Symbol</Label>
              <Input
                id="currency_symbol"
                placeholder="$"
                value={appSettings.currency_symbol}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings, 'string')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="default_country_code">Default Country Code</Label>
              <Input
                id="default_country_code"
                placeholder="US"
                value={appSettings.default_country_code}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings, 'string')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact_us_mobile">Contact Us Mobile Number</Label>
              <Input
                id="contact_us_mobile"
                placeholder="123456789"
                value={appSettings.contact_us_mobile}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings, 'string')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact_us_link">Contact Us Page Link</Label>
              <Input
                id="contact_us_link"
                placeholder="http://contact.us"
                value={appSettings.contact_us_link}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings, 'string')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="show_wallet_feature">Show Wallet Feature</Label>
              <Input
                id="show_wallet_feature"
                placeholder="yes"
                value={appSettings.show_wallet_feature}
                onChange={(e) => handleInputChange(e, appSettings, setAppSettings, 'string')}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Referral Settings */}
      <TabsContent value="Referral">
        <Card>
          <CardHeader>
            <CardTitle>Referral Settings</CardTitle>
            <CardDescription>
              Make changes to your referral here. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="user_referral_comission">User Referral Commission (in percentage)</Label>
              <Input
                id="user_referral_comission"
                placeholder="1"
                value={referralSettings.user_referral_comission}
                onChange={(e) => handleInputChange(e, referralSettings, setReferralSettings, 'number')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="driver_referral_comission">Driver Referral Commission (in percentage)</Label>
              <Input
                id="driver_referral_comission"
                placeholder="1"
                value={referralSettings.driver_referral_comission}
                onChange={(e) => handleInputChange(e, referralSettings, setReferralSettings, 'number')}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Map Settings */}
      <TabsContent value="MapSettings">
        <Card>
          <CardHeader>
            <CardTitle>Map Settings</CardTitle>
            <CardDescription>
              Make changes to your map here. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="google_map_key">Google Map Key (web)</Label>
              <Input
                id="google_map_key"
                placeholder="key"
                value={mapSettings.google_map_key}
                onChange={(e) => handleInputChange(e, mapSettings, setMapSettings, 'string')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="google_map_key_distance">Google Map Key (distance)</Label>
              <Input
                id="google_map_key_distance"
                placeholder="key"
                value={mapSettings.google_map_key_distance}
                onChange={(e) => handleInputChange(e, mapSettings, setMapSettings, 'string')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="google_sheet_id">Google Sheet ID</Label>
              <Input
                id="google_sheet_id"
                placeholder="id"
                value={mapSettings.google_sheet_id}
                onChange={(e) => handleInputChange(e, mapSettings, setMapSettings, 'string')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="default_latitude">Default Latitude</Label>
              <Input
                id="default_latitude"
                placeholder="0.0"
                value={mapSettings.default_latitude}
                onChange={(e) => handleInputChange(e, mapSettings, setMapSettings, 'float')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="default_longitude">Default Longitude</Label>
              <Input
                id="default_longitude"
                placeholder="0.0"
                value={mapSettings.default_longitude}
                onChange={(e) => handleInputChange(e, mapSettings, setMapSettings, 'float')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="enable_vase_map">Enable VASE Map</Label>
              <Input
                id="enable_vase_map"
                placeholder="yes"
                value={mapSettings.enable_vase_map}
                onChange={(e) => handleInputChange(e, mapSettings, setMapSettings, 'string')}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Bin Settings */}
      <TabsContent value="BinSettings">
        <Card>
          <CardHeader>
            <CardTitle>Bin Settings</CardTitle>
            <CardDescription>
              Configure bin types and their properties. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {binSettings.bins.map((bin, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Bin {index + 1}</h3>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeBinItem(index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`binType-${index}`}>Bin Type</Label>
                    <Input
                      id={`binType-${index}`}
                      placeholder="mini"
                      value={bin.binType}
                      onChange={(e) => handleBinItemChange(index, 'binType', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`capacity-${index}`}>Capacity</Label>
                    <Input
                      id={`capacity-${index}`}
                      type="number"
                      placeholder="12"
                      value={bin.capacity}
                      onChange={(e) => handleBinItemChange(index, 'capacity', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`price-${index}`}>Price</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      placeholder="500"
                      value={bin.price}
                      onChange={(e) => handleBinItemChange(index, 'price', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`equivalentBags-${index}`}>Equivalent Bags</Label>
                    <Input
                      id={`equivalentBags-${index}`}
                      placeholder="Equivalent to 2 extra-large bags"
                      value={bin.equivalentBags}
                      onChange={(e) => handleBinItemChange(index, 'equivalentBags', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Is Active</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`isActive-${index}`}
                        checked={bin.isActive}
                        onChange={(e) => handleBinItemChange(index, 'isActive', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`isActive-${index}`} className="text-sm">
                        Active
                      </Label>
                    </div>
                  </div>
                </div>
                
                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label>Bin Image</Label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => {
                        if (el) {
                          fileInputRefs.current[index] = el;
                        }
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(index, file);
                        }
                      }}
                      className="hidden"
                      id={`imageUpload-${index}`}
                    />
                     <Input
                      id={`imageUrl-${index}`}
                      type=''
                      placeholder="https://example.com/image.jpg"
                      value={bin.imageUrl}
                      onChange={(e) => handleBinItemChange(index, 'imageUrl', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRefs.current[index]?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                    {bin.imageUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 text-white w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  {bin.imageUrl && (
                    <div className="mt-2">
                      <Image 
                        src={bin.imageUrl} 
                        alt="Bin preview" 
                        width={96}
                        height={96}
                        className="object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Button onClick={addBinItem} variant="outline">
                Add Bin
              </Button>
              <Button onClick={saveBinSettings} className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Bin Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}