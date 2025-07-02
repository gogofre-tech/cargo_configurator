"use client"; // Add this line to mark as a Client Component

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming this is the correct path
import Image from 'next/image';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OptionConfig { // Renamed from Option to avoid conflict with HTMLOptionElement if used globally
  id: string;
  label: string;
  price: number;
  type: 'boolean' | 'choice'; // 'choice' could involve sub_options or a different rendering
  default_value?: boolean;    // Indicates if the option is selected by default
  category?: string;          // To group options or handle special logic e.g. "thermal_choice"
  description?: string;       // Description for tooltip/popover
  // sub_options?: OptionConfig[]; // For future 'choice' type
}

interface BikeModel {
  model: string;
  manufacturer: string;
  category: string;
  base_price: number;
  image_filename: string;
  options?: OptionConfig[]; // All configurable options are now in this array
  // Remove individual optional fields like available_configurations, safety_features etc. if they are fully covered by the new options array.
  // Keep them if they contain non-configurable descriptive data. For now, assume 'options' is comprehensive.
  [key: string]: any; // Allow other properties from original config if needed for display
}

interface ConfigData {
  bike: BikeModel[];
}

const ConfiguratorPage = () => {
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [selectedBike, setSelectedBike] = useState<BikeModel | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // State for contact form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);


  useEffect(() => {
    fetch('/config/config.json') // Path relative to the public directory
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then((data: ConfigData) => {
        setBikeModels(data.bike);
      })
      .catch((error) => {
        console.error('Error fetching bike data:', error);
      });
  }, []);

  useEffect(() => {
    if (selectedBike) {
      const initialSelected: Record<string, boolean> = {};
      let currentTotalPrice = selectedBike.base_price || 0;

      (selectedBike.options || []).forEach(opt => {
        initialSelected[opt.id] = opt.default_value || false;
        if (opt.default_value) {
          currentTotalPrice += opt.price;
        }
      });

      setSelectedOptions(initialSelected);
      setTotalPrice(currentTotalPrice);
    } else {
      setSelectedOptions({});
      setTotalPrice(0);
    }
  }, [selectedBike]);

  // Recalculate price when options change
  useEffect(() => {
    if (selectedBike) {
      let newTotal = selectedBike.base_price || 0;
      (selectedBike.options || []).forEach(opt => {
        if (selectedOptions[opt.id]) {
          // Special handling for mutually exclusive choices like 'thermal_choice'
          if (opt.category === 'thermal_choice') {
            // Ensure only the currently selected thermal option's price is added
            // This logic assumes only one thermal_choice can be true in selectedOptions
            newTotal += opt.price;
          } else {
            newTotal += opt.price;
          }
        }
      });
      setTotalPrice(newTotal);
    }
  }, [selectedOptions, selectedBike]);


  const handleSelectBike = (bike: BikeModel) => {
    setSelectedBike(bike);
  };

  const handleOptionChange = (optionId: string, category?: string) => {
    setSelectedOptions(prev => {
      const newSelected = { ...prev };

      // Handle 'thermal_choice' category for mutually exclusive selection
      if (category === 'thermal_choice') {
        // If the clicked option is already selected, deselect it (allow no thermal option)
        // Or, if business rule is one must be selected, this logic would change.
        // For now, allow toggling off.
        if (newSelected[optionId]) {
          newSelected[optionId] = false;
        } else {
          // Deselect all other thermal options
          (selectedBike?.options || []).forEach(opt => {
            if (opt.category === 'thermal_choice') {
              newSelected[opt.id] = false;
            }
          });
          // Select the clicked one
          newSelected[optionId] = true;
        }
      } else {
        // Regular toggle for other options
        newSelected[optionId] = !newSelected[optionId];
      }
      return newSelected;
    });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submissionData = {
      bikeModel: selectedBike?.model,
      totalPrice,
      options: selectedOptions, // Consider sending a more structured version of options if needed
      contactName,
      contactEmail,
      contactCompany,
    };

    console.log("Submitting Data:", submissionData);

    fetch('/api/submit-configuration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData),
    })
    .then(async response => {
      const responseBody = await response.json();
      if (!response.ok) {
        throw new Error(responseBody.message || `API request failed with status ${response.status}`);
      }
      return responseBody;
    })
    .then(data => {
      console.log('Success from API:', data);
      setFormSubmitted(true);
    })
    .catch((error) => {
      console.error('Error submitting form to API:', error);
      // Optionally, show an error message to the user
      alert(`Error submitting request: ${error.message}`);
      // Keep form active if submission fails
      setFormSubmitted(false);
    });

    // setFormSubmitted(true); // Moved to .then() to only show success if API call is successful (or appears so)
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Bike Configurator</h1>

      {!selectedBike ? (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-center">Select a Bike Model</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bikeModels.map((bike) => (
              <Card key={bike.model} onClick={() => handleSelectBike(bike)} className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
                {bike.image_filename && (
                  <div className="relative w-full h-48">
                    <Image
                      src={`/assets/images/${bike.image_filename}`}
                      alt={bike.model}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{bike.model}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{bike.manufacturer}</p>
                  <p className="text-md mt-1">{bike.category}</p>
                  <p className="text-lg font-semibold mt-2">€{bike.base_price?.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        // New 2-column layout for selected bike view
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left Column (Image - Anchored/Sticky) */}
          <div className="w-full md:w-1/2 md:sticky md:top-8">
            <button
              onClick={() => setSelectedBike(null)}
              className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow transition-colors"
            >
              &larr; Back to Models
            </button>
            {selectedBike.image_filename && (
              <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={`/assets/images/${selectedBike.image_filename}`}
                  alt={selectedBike.model}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            )}
          </div>

          {/* Right Column (Details, Options, Summary, Form - Scrollable) */}
          <div className="w-full md:w-1/2 space-y-6">
            <div> {/* Details Section */}
              <h2 className="text-3xl font-bold mb-2">{selectedBike.model}</h2>
              <p className="text-lg text-gray-700 mb-1">{selectedBike.manufacturer}</p>
              <p className="text-md text-gray-600 mb-4">{selectedBike.category}</p>
              <p className="text-2xl font-semibold text-blue-600 mb-6">Base Price: €{selectedBike.base_price?.toLocaleString()}</p>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50 shadow"> {/* Options Section */}
              <h3 className="text-xl font-semibold mb-4 text-center">Customization Options</h3>
              {selectedBike?.options && selectedBike.options.length > 0 ? (
                (() => {
                  const groupedOptions: Record<string, OptionConfig[]> = {};
                  selectedBike.options!.forEach(option => {
                    const category = option.category || "General";
                    if (!groupedOptions[category]) {
                      groupedOptions[category] = [];
                    }
                    groupedOptions[category].push(option);
                  });

                  const categoryOrder = ["available_configurations", "comfort_equipment", "safety_features", "storage", "storage.box_storage", "braking", "thermal_choice", "General"];
                  const sortedCategories = Object.keys(groupedOptions).sort((a, b) => {
                    let indexA = categoryOrder.indexOf(a);
                    let indexB = categoryOrder.indexOf(b);
                    if (indexA === -1) indexA = categoryOrder.length;
                    if (indexB === -1) indexB = categoryOrder.length;
                    return indexA - indexB;
                  });

                  return sortedCategories.map(category => (
                    <div key={category} className="mb-6">
                      <h4 className="text-lg font-medium capitalize text-gray-700 mb-3 border-b pb-2">
                        {category.replace(/_/g, ' ').replace(/\./g, ' - ')}
                      </h4>
                      <div className="space-y-3">
                        {groupedOptions[category].map((option) => (
                          <div key={option.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                            <Checkbox
                              id={option.id}
                              checked={selectedOptions[option.id] || false}
                              onCheckedChange={() => handleOptionChange(option.id, option.category)}
                            />
                            <Label
                              htmlFor={option.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              title={option.description}
                            >
                              {option.label}
                              {option.price > 0 && <span className="text-xs text-gray-500 ml-2">(+€{option.price.toLocaleString()})</span>}
                              {!option.price && selectedBike.base_price && option.default_value === undefined && !option.category?.includes("choice") && <span className="text-xs text-gray-400 ml-2">(Included)</span>}
                              {option.price === 0 && option.default_value !== true && !option.category?.includes("choice") && <span className="text-xs text-green-600 ml-2">(Free Option)</span>}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()
              ) : (
                <p className="text-gray-500 text-center">No specific customization options listed for this model, or they are included as standard.</p>
              )}
            </div>

            <div className="p-6 border rounded-lg bg-white shadow-md"> {/* Summary Section */}
              <h3 className="text-xl font-semibold mb-1 text-gray-700">Configuration Summary</h3>
              <p className="text-sm text-gray-500 mb-3">Base Price: €{selectedBike.base_price?.toLocaleString()}</p>
              <div className="mb-3">
                <h4 className="text-md font-semibold text-gray-600 mb-1">Selected Options:</h4>
                <ul className="list-disc list-inside pl-1 text-sm">
                  {selectedBike.options?.filter(opt => selectedOptions[opt.id] && opt.price > 0).map(opt => (
                    <li key={`summary-${opt.id}`} className="text-gray-600">
                      {opt.label}: <span className="font-medium">€{opt.price.toLocaleString()}</span>
                    </li>
                  ))}
                  {selectedBike.options?.filter(opt => selectedOptions[opt.id] && opt.price === 0 && opt.default_value !== true).length > 0 &&
                    selectedBike.options?.filter(opt => selectedOptions[opt.id] && opt.price === 0 && opt.default_value !== true ).map(opt => (
                       <li key={`summary-${opt.id}`} className="text-gray-600">{opt.label}: <span className="font-medium text-green-600">Free</span></li>
                    ))
                  }
                </ul>
                 {selectedBike.options?.filter(opt => selectedOptions[opt.id]).length === 0 && <p className="text-xs text-gray-400">No additional options selected.</p>}
              </div>
              <hr className="my-3"/>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Total Price:</h3>
                <p className="text-2xl font-bold text-blue-700">€{totalPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Contact Form moved here */}
            <div className="mt-8 border-t pt-8">
              <h2 className="text-2xl font-semibold mb-6 text-center">Request a Quote / More Information</h2>
              {!formSubmitted ? (
                <form onSubmit={handleFormSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                  <div>
                    <Label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</Label>
                    <Input type="text" id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} required className="w-full" placeholder="e.g. Jane Doe"/>
                  </div>
                  <div>
                    <Label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Email Address</Label>
                    <Input type="email" id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className="w-full" placeholder="e.g. jane.doe@example.com"/>
                  </div>
                  <div>
                    <Label htmlFor="contactCompany" className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</Label>
                    <Input type="text" id="contactCompany" value={contactCompany} onChange={(e) => setContactCompany(e.target.value)} className="w-full" placeholder="e.g. Acme Corp"/>
                  </div>
                  <Button type="submit" className="w-full text-lg py-3">Submit Request</Button>
                </form>
              ) : (
                <div className="text-center bg-green-50 p-8 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-green-700 mb-3">Thank You!</h3>
                  <p className="text-gray-700">Your request has been submitted. We will get back to you shortly.</p>
                  <p className="text-sm text-gray-600 mt-2">Details:</p>
                  <ul className="text-xs text-gray-500 list-disc list-inside">
                    <li>Bike: {selectedBike?.model}</li>
                    <li>Total Price: €{totalPrice.toLocaleString()}</li>
                    <li>Name: {contactName}</li>
                    <li>Email: {contactEmail}</li>
                    {contactCompany && <li>Company: {contactCompany}</li>}
                  </ul>
                  <Button onClick={() => {setFormSubmitted(false); setContactName(''); setContactEmail(''); setContactCompany('');}} className="mt-6">
                    Submit Another Request
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguratorPage;
