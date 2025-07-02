"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OptionConfig {
  id: string;
  label: string;
  price: number;
  type: 'boolean' | 'choice';
  default_value?: boolean;
  category?: string;
  description?: string;
  image_filename_override?: string;
}

interface BikeModel {
  model: string;
  nom_modele_fr: string;
  fabricant: string;
  categorie_fr: string;
  usages_fr?: string[];
  base_price: number;
  image_filename: string;
  options?: OptionConfig[];
  introduction_fr?: string;
  [key: string]: any;
}

interface ConfigData {
  bike: BikeModel[];
}

const ConfiguratorPage = () => {
  const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
  const [selectedBike, setSelectedBike] = useState<BikeModel | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [currentDisplayImage, setCurrentDisplayImage] = useState<string | null>(null);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    fetch('/config/config_v2.json')
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
      // CORRECTED HERE:
      setCurrentDisplayImage(selectedBike.image_filename);

      if (selectedBike.model === "Pick-up 350") { // CORRECTED HERE
        const defaultPlatformOption = selectedBike.options?.find(opt => opt.category === "Type de plateau" && initialSelected[opt.id]); // CORRECTED HERE
        if (defaultPlatformOption && defaultPlatformOption.image_filename_override) {
          setCurrentDisplayImage(defaultPlatformOption.image_filename_override);
        }
      }
    } else {
      setSelectedOptions({});
      setTotalPrice(0);
      setCurrentDisplayImage(null);
    }
  }, [selectedBike]);

  useEffect(() => {
    if (selectedBike) {
      let newTotal = selectedBike.base_price || 0;
      let newImage = selectedBike.image_filename;

      (selectedBike.options || []).forEach(opt => {
        if (selectedOptions[opt.id]) {
          newTotal += opt.price;
          if (selectedBike.model === "Pick-up 350" && opt.category === "Type de plateau" && opt.image_filename_override) {
            newImage = opt.image_filename_override;
          }
        }
      });
      setTotalPrice(newTotal);
      setCurrentDisplayImage(newImage);
    }
  }, [selectedOptions, selectedBike]);

  const handleSelectBike = (bike: BikeModel) => {
    setSelectedBike(bike);
  };

  const handleOptionChange = (optionId: string, category?: string) => {
    setSelectedOptions(prev => {
      const newSelected = { ...prev };
      if (category === 'Configuration thermique' || (selectedBike?.model === "Pick-up 350" && category === "Type de plateau")) {
        if (newSelected[optionId] && category === "Type de plateau") {
          return prev;
        }
        (selectedBike?.options || []).forEach(opt => {
          if (opt.category === category) {
            newSelected[opt.id] = false;
          }
        });
        newSelected[optionId] = !prev[optionId] || category === "Type de plateau" ? true : !prev[optionId];
        if (selectedBike?.model === "Pick-up 350" && category === "Type de plateau") {
            const isAnySelected = (selectedBike?.options || []).some(opt => opt.category === category && newSelected[opt.id]);
            if(!isAnySelected) {
                newSelected[optionId] = true;
            }
        }
      } else {
        newSelected[optionId] = !newSelected[optionId];
      }
      return newSelected;
    });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submissionData = {
      bikeModel: selectedBike?.nom_modele_fr || selectedBike?.model, // Use French name
      totalPrice,
      options: selectedOptions,
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
      alert(`Erreur lors de la soumission de la demande: ${error.message}`); // Translated error
      setFormSubmitted(false);
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      {!selectedBike ? (
        <>
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Choisissez un modèle de vélo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bikeModels.map((bike) => (
              <Card key={bike.model} onClick={() => handleSelectBike(bike)} className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
                {bike.image_filename && (
                  <div className="relative w-full h-48">
                    <Image
                      src={`/assets/images/${bike.image_filename}`}
                      alt={bike.nom_modele_fr || bike.model}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{bike.nom_modele_fr || bike.model}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{bike.fabricant}</p>
                  <p className="text-md mt-1">{bike.categorie_fr}</p>
                  <p className="text-lg font-semibold mt-2">€{bike.base_price?.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/2 md:sticky md:top-8">
            <button
              onClick={() => setSelectedBike(null)}
              className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow transition-colors"
            >
              &larr; Retour aux modèles
            </button>
            {selectedBike.image_filename && (
              <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={`/assets/images/${currentDisplayImage || selectedBike.image_filename}`}
                  alt={selectedBike.nom_modele_fr || selectedBike.model}
                  layout="fill"
                  objectFit="contain"
                  key={currentDisplayImage}
                />
              </div>
            )}
          </div>
          <div className="w-full md:w-1/2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-3xl font-bold mb-2">{selectedBike.nom_modele_fr || selectedBike.model}</h2>
              {selectedBike.introduction_fr && (
                <p className="text-md text-gray-700 mb-4 leading-relaxed">{selectedBike.introduction_fr}</p>
              )}
              <p className="text-lg text-gray-600 mb-1"><span className="font-semibold">Fabricant:</span> {selectedBike.fabricant}</p>
              <p className="text-md text-gray-600 mb-4"><span className="font-semibold">Catégorie:</span> {selectedBike.categorie_fr}</p>
              <p className="text-2xl font-semibold text-blue-700">Prix de base : €{selectedBike.base_price?.toLocaleString()}</p>
            </div>
            <div className="p-6 border rounded-lg bg-white shadow">
              <h3 className="text-2xl font-semibold mb-6 text-center border-b pb-3">Options de personnalisation</h3>
              {selectedBike?.options && selectedBike.options.length > 0 ? (
                (() => {
                  const groupedOptions: Record<string, OptionConfig[]> = {};
                  selectedBike.options!.forEach(option => {
                    const category = option.category || "Autres options";
                    if (!groupedOptions[category]) {
                      groupedOptions[category] = [];
                    }
                    groupedOptions[category].push(option);
                  });
                  const categoryOrderFr = ["Sécurité et conduite", "Équipements et confort", "Gestion du chargement", "Type de plateau", "Options de plateforme", "Options de chargement", "Gestion de la benne", "Configuration thermique", "Autres options"];
                  const sortedCategories = Object.keys(groupedOptions).sort((a, b) => {
                    let indexA = categoryOrderFr.indexOf(a);
                    let indexB = categoryOrderFr.indexOf(b);
                    if (indexA === -1) indexA = categoryOrderFr.length;
                    if (indexB === -1) indexB = categoryOrderFr.length;
                    return indexA - indexB;
                  });
                  return sortedCategories.map(category => (
                    <div key={category} className="mb-6 last:mb-0">
                      <h4 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">
                        {category}
                      </h4>
                      <div className="space-y-3">
                        {groupedOptions[category].map((option) => (
                          <div key={option.id} className="flex items-center space-x-3 p-2.5 rounded-md hover:bg-gray-50 transition-colors">
                            <Checkbox
                              id={option.id}
                              checked={selectedOptions[option.id] || false}
                              onCheckedChange={() => handleOptionChange(option.id, option.category)}
                            />
                            <Label
                              htmlFor={option.id}
                              className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow"
                              title={option.description}
                            >
                              {option.label}
                              {option.price > 0 && <span className="text-xs text-gray-500 ml-2 font-normal">(+€{option.price.toLocaleString()})</span>}
                              {!option.price && selectedBike.base_price && option.default_value === undefined && !option.category?.includes("choice") && <span className="text-xs text-gray-400 ml-2 font-normal">(Inclus)</span>}
                              {option.price === 0 && option.default_value !== true && !option.category?.includes("choice") && <span className="text-xs text-green-600 ml-2 font-normal">(Option gratuite)</span>}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()
              ) : (
                <p className="text-gray-500 text-center py-4">Aucune option de personnalisation spécifique listée pour ce modèle, ou elles sont incluses de base.</p>
              )}
            </div>
            <div className="p-6 border rounded-lg bg-white shadow">
              <h3 className="text-2xl font-semibold mb-3 text-gray-800 border-b pb-3">Récapitulatif</h3>
              <div className="space-y-1 text-sm mb-3">
                <div className="flex justify-between"><span>Prix de base :</span> <span>€{selectedBike.base_price?.toLocaleString()}</span></div>
                {selectedBike.options?.filter(opt => selectedOptions[opt.id] && opt.price > 0).map(opt => (
                  <div key={`summary-${opt.id}`} className="flex justify-between text-gray-600">
                    <span>{opt.label}:</span> <span className="font-medium">€{opt.price.toLocaleString()}</span>
                  </div>
                ))}
                {selectedBike.options?.filter(opt => selectedOptions[opt.id] && opt.price === 0 && opt.default_value !== true).map(opt => (
                   <div key={`summary-${opt.id}`} className="flex justify-between text-gray-600"><span>{opt.label}:</span> <span className="font-medium text-green-600">Gratuit</span></div>
                ))}
              </div>
              {selectedBike.options?.filter(opt => selectedOptions[opt.id] && (opt.price > 0 || (opt.price === 0 && opt.default_value !== true))).length === 0 && <p className="text-xs text-gray-400 mb-3">Aucune option supplémentaire sélectionnée.</p>}
              <hr className="my-3"/>
              <div className="flex justify-between items-center mt-3">
                <h3 className="text-xl font-bold text-gray-800">Prix Total :</h3>
                <p className="text-2xl font-bold text-blue-700">€{totalPrice.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t">
              <h2 className="text-2xl font-semibold mb-6 text-center">Demander un devis / Plus d'informations</h2>
              {!formSubmitted ? (
                <form onSubmit={handleFormSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                  <div>
                    <Label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</Label>
                    <Input type="text" id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} required className="w-full" placeholder="Ex: Jeanne Dupont"/>
                  </div>
                  <div>
                    <Label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</Label>
                    <Input type="email" id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className="w-full" placeholder="Ex: jeanne.dupont@example.com"/>
                  </div>
                  <div>
                    <Label htmlFor="contactCompany" className="block text-sm font-medium text-gray-700 mb-1">Société (Optionnel)</Label>
                    <Input type="text" id="contactCompany" value={contactCompany} onChange={(e) => setContactCompany(e.target.value)} className="w-full" placeholder="Ex: Acme Corp"/>
                  </div>
                  <Button type="submit" className="w-full text-lg py-3">Envoyer la demande</Button>
                </form>
              ) : (
                <div className="text-center bg-green-50 p-8 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-green-700 mb-3">Merci !</h3>
                  <p className="text-gray-700">Votre demande a été soumise. Nous vous recontacterons sous peu.</p>
                  <p className="text-sm text-gray-600 mt-2">Détails :</p>
                  <ul className="text-xs text-gray-500 list-disc list-inside">
                    <li>Vélo : {selectedBike?.nom_modele_fr || selectedBike?.model}</li>
                    <li>Prix Total : €{totalPrice.toLocaleString()}</li>
                    <li>Nom : {contactName}</li>
                    <li>Email : {contactEmail}</li>
                    {contactCompany && <li>Société: {contactCompany}</li>}
                  </ul>
                  <Button onClick={() => {setFormSubmitted(false); setContactName(''); setContactEmail(''); setContactCompany('');}} className="mt-6">
                    Envoyer une autre demande
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
