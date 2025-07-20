import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, Palette, Video, CheckCircle, Star, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PricingData {
  serviceType: 'graphic' | 'video' | 'both' | '';
  
  // Graphic Design Data
  designPieces: string;
  designHours: string;
  designTypes: string[];
  customDesignType: string;
  bilingual: boolean;
  
  // Video Editing Data
  videoCount: string;
  videoDuration: string;
  videoTypes: string[];
  customVideoType: string;
  editingQuality: string;
  footageReady: string;
  needCaptions: boolean;
  needStock: boolean;
  
  // Lead Data
  name: string;
  company: string;
  email: string;
  phone: string;
}

interface PricingResult {
  monthlyPrice: number;
  breakdown: {
    basePrice: number;
    volumeAdjustment: number;
    complexityAdjustment: number;
    bilingualBonus: number;
    addOns: number;
  };
  includes: string[];
}

const PricingCalculator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [data, setData] = useState<PricingData>({
    serviceType: '',
    designPieces: '',
    designHours: '',
    designTypes: [],
    customDesignType: '',
    bilingual: false,
    videoCount: '',
    videoDuration: '',
    videoTypes: [],
    customVideoType: '',
    editingQuality: '',
    footageReady: '',
    needCaptions: false,
    needStock: false,
    name: '',
    company: '',
    email: '',
    phone: ''
  });
  
  const { toast } = useToast();

  const designTypeOptions = [
    'Social Media Posts',
    'Website Graphics', 
    'Banners / Ads',
    'Brochures / Company Profiles',
    'Packaging / Labels',
    'Other'
  ];

  const videoTypeOptions = [
    'Reels / TikToks',
    'YouTube Videos',
    'Explainer Videos', 
    'Ads',
    'Other'
  ];

  const calculatePricing = (): PricingResult => {
    let result: PricingResult = {
      monthlyPrice: 0,
      breakdown: {
        basePrice: 0,
        volumeAdjustment: 0,
        complexityAdjustment: 0,
        bilingualBonus: 0,
        addOns: 0
      },
      includes: []
    };

    if (data.serviceType === 'graphic' || data.serviceType === 'both') {
      // Graphic Design Pricing Logic
      let graphicPrice = 499; // Base plan
      let includes = ['2.5 hours design work/day', 'Up to 30 social-style designs/month'];
      
      // Volume adjustment
      const pieceCount = parseInt(data.designPieces.split('–')[1] || data.designPieces.replace('+', ''));
      if (pieceCount > 30) {
        const volumeIncrease = Math.ceil((pieceCount - 30) / 10) * 150;
        result.breakdown.volumeAdjustment += volumeIncrease;
        includes[1] = `Up to ${pieceCount} designs/month`;
      }
      
      // Hours adjustment
      if (data.designHours.includes('3–4')) {
        result.breakdown.complexityAdjustment += 200;
        includes[0] = '3-4 hours design work/day';
      } else if (data.designHours.includes('5+')) {
        result.breakdown.complexityAdjustment += 400;
        includes[0] = '5+ hours design work/day';
      }
      
      // Complexity adjustment for brochures
      if (data.designTypes.includes('Brochures / Company Profiles')) {
        result.breakdown.complexityAdjustment += 300;
        includes.push('Complex brochures & company profiles');
      }
      
      // Bilingual bonus
      if (data.bilingual) {
        result.breakdown.bilingualBonus += 100;
        includes.push('Arabic & English designs');
      }
      
      result.breakdown.basePrice += graphicPrice;
      result.includes.push(...includes);
    }

    if (data.serviceType === 'video' || data.serviceType === 'both') {
      // Video Editing Pricing Logic
      let videoPrice = 699; // Base plan
      let includes = ['2.5 hours editing/day', 'Up to 10 reels/month'];
      
      // Volume adjustment
      const videoCount = parseInt(data.videoCount.split('–')[1] || data.videoCount.replace('+', ''));
      if (videoCount > 10) {
        const volumeIncrease = Math.ceil((videoCount - 10) / 5) * 200;
        result.breakdown.volumeAdjustment += volumeIncrease;
        includes[1] = `Up to ${videoCount} videos/month`;
      }
      
      // Quality adjustment
      if (data.editingQuality === 'premium') {
        result.breakdown.complexityAdjustment += 400;
        includes.push('Premium editing with motion graphics');
      } else {
        includes.push('Basic editing with subtitles & effects');
      }
      
      // Footage support
      if (data.footageReady === 'need-help') {
        result.breakdown.addOns += 200;
        includes.push('Script & footage creation support');
      }
      
      // Add-ons
      if (data.needCaptions) {
        result.breakdown.addOns += 50;
        includes.push('Professional captions/subtitles');
      }
      
      if (data.needStock) {
        result.breakdown.addOns += 100;
        includes.push('Stock footage & music library');
      }
      
      // Duration complexity
      if (data.videoDuration.includes('3–5') || data.videoDuration.includes('5+')) {
        result.breakdown.complexityAdjustment += 200;
        includes.push('Long-form video editing');
      }
      
      result.breakdown.basePrice += videoPrice;
      result.includes.push(...includes);
    }

    result.monthlyPrice = Object.values(result.breakdown).reduce((sum, val) => sum + val, 0);
    
    return result;
  };

  const handleServiceSelect = (service: 'graphic' | 'video' | 'both') => {
    setData({ ...data, serviceType: service });
    setCurrentStep(2);
  };

  const handleDesignTypeToggle = (type: string) => {
    const updatedTypes = data.designTypes.includes(type)
      ? data.designTypes.filter(t => t !== type)
      : [...data.designTypes, type];
    setData({ ...data, designTypes: updatedTypes });
  };

  const handleVideoTypeToggle = (type: string) => {
    const updatedTypes = data.videoTypes.includes(type)
      ? data.videoTypes.filter(t => t !== type)
      : [...data.videoTypes, type];
    setData({ ...data, videoTypes: updatedTypes });
  };

  const handleLeadCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email to see your custom estimate.",
        variant: "destructive"
      });
      return;
    }
    setShowResults(true);
  };

  const canProceedToLead = () => {
    if (data.serviceType === 'graphic' || data.serviceType === 'both') {
      return data.designPieces && data.designHours && data.designTypes.length > 0;
    }
    if (data.serviceType === 'video') {
      return data.videoCount && data.videoDuration && data.videoTypes.length > 0 && data.editingQuality && data.footageReady;
    }
    return false;
  };

  if (showResults) {
    const pricing = calculatePricing();
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl animate-scale-in shadow-creative">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-creative-yellow to-creative-green rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-creative-dark-green" />
            </div>
            <CardTitle className="text-3xl font-bold text-creative-dark-green mb-2">
              Your Custom Estimate
            </CardTitle>
            <p className="text-muted-foreground">Tailored specifically for {data.name || 'your business'}</p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-creative-dark-green mb-2">
                ${pricing.monthlyPrice.toLocaleString()}
                <span className="text-lg text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground">Custom monthly subscription</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg text-creative-dark-green">What's Included:</h3>
              <div className="grid gap-2">
                {pricing.includes.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-creative-green" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-6 space-y-3">
              <h4 className="font-semibold text-creative-dark-green">Pricing Breakdown:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Plan</span>
                  <span>${pricing.breakdown.basePrice}</span>
                </div>
                {pricing.breakdown.volumeAdjustment > 0 && (
                  <div className="flex justify-between">
                    <span>Volume Adjustment</span>
                    <span>+${pricing.breakdown.volumeAdjustment}</span>
                  </div>
                )}
                {pricing.breakdown.complexityAdjustment > 0 && (
                  <div className="flex justify-between">
                    <span>Complexity Adjustment</span>
                    <span>+${pricing.breakdown.complexityAdjustment}</span>
                  </div>
                )}
                {pricing.breakdown.bilingualBonus > 0 && (
                  <div className="flex justify-between">
                    <span>Bilingual Content</span>
                    <span>+${pricing.breakdown.bilingualBonus}</span>
                  </div>
                )}
                {pricing.breakdown.addOns > 0 && (
                  <div className="flex justify-between">
                    <span>Add-ons</span>
                    <span>+${pricing.breakdown.addOns}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="creative" 
                size="lg" 
                className="flex-1"
                onClick={() => window.open('https://calendly.com/8creatives', '_blank')}
              >
                <Phone className="mr-2 h-5 w-5" />
                Book A Free Strategy Call
              </Button>
              <Button 
                variant="creative-outline" 
                size="lg" 
                className="flex-1"
                onClick={() => window.print()}
              >
                Download Estimate PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl animate-fade-in shadow-creative">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-bold text-creative-dark-green mb-4">
            Creative Pricing Calculator
          </CardTitle>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get a personalized estimate for your unlimited creative subscription based on your specific needs
          </p>
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div 
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step <= currentStep ? 'bg-creative-yellow' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-creative-dark-green mb-4">
                  What creative services do you need help with?
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-2 border-2 hover:border-creative-yellow"
                  onClick={() => handleServiceSelect('graphic')}
                >
                  <CardContent className="p-8 text-center">
                    <Palette className="h-12 w-12 text-creative-green mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-creative-dark-green mb-2">Graphic Design</h3>
                    <p className="text-muted-foreground">Social media posts, websites, branding, and more</p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-2 border-2 hover:border-creative-yellow"
                  onClick={() => handleServiceSelect('video')}
                >
                  <CardContent className="p-8 text-center">
                    <Video className="h-12 w-12 text-creative-green mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-creative-dark-green mb-2">Video Editing</h3>
                    <p className="text-muted-foreground">Reels, YouTube videos, ads, and explainer content</p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-2 border-2 hover:border-creative-yellow relative"
                  onClick={() => handleServiceSelect('both')}
                >
                  <div className="absolute -top-3 -right-3 bg-creative-yellow text-creative-dark-green px-3 py-1 rounded-full text-xs font-bold">
                    POPULAR
                  </div>
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center space-x-2 mb-4">
                      <Palette className="h-8 w-8 text-creative-green" />
                      <Video className="h-8 w-8 text-creative-green" />
                    </div>
                    <h3 className="font-bold text-lg text-creative-dark-green mb-2">Both Services</h3>
                    <p className="text-muted-foreground">Complete creative solution for all your needs</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 2 && (data.serviceType === 'graphic' || data.serviceType === 'both') && (
            <div className="space-y-8 animate-slide-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-creative-dark-green mb-4">
                  Tell us about your graphic design needs
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold text-creative-dark-green mb-4 block">
                      How many creative design pieces do you need per month?
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {['5–10', '11–20', '21–30', '30+'].map((option) => (
                        <Button
                          key={option}
                          variant={data.designPieces === option ? 'creative' : 'creative-outline'}
                          onClick={() => setData({ ...data, designPieces: option })}
                          className="justify-center"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-creative-dark-green mb-4 block">
                      How many hours of dedicated design work per day would you need?
                    </Label>
                    <div className="space-y-3">
                      {[
                        { value: '2.5', label: '2.5 hours (base plan)' },
                        { value: '3–4', label: '3–4 hours' },
                        { value: '5+', label: '5+ hours' }
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={data.designHours === option.value ? 'creative' : 'creative-outline'}
                          onClick={() => setData({ ...data, designHours: option.value })}
                          className="w-full justify-start"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold text-creative-dark-green mb-4 block">
                      What kind of designs do you need? (Select all that apply)
                    </Label>
                    <div className="space-y-3">
                      {designTypeOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-3">
                          <Checkbox
                            id={option}
                            checked={data.designTypes.includes(option)}
                            onCheckedChange={() => handleDesignTypeToggle(option)}
                          />
                          <Label htmlFor={option} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                    
                    {data.designTypes.includes('Other') && (
                      <Input
                        placeholder="Please specify..."
                        value={data.customDesignType}
                        onChange={(e) => setData({ ...data, customDesignType: e.target.value })}
                        className="mt-3"
                      />
                    )}
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-creative-dark-green mb-4 block">
                      Do you need designs in both Arabic & English?
                    </Label>
                    <div className="flex space-x-3">
                      <Button
                        variant={data.bilingual ? 'creative' : 'creative-outline'}
                        onClick={() => setData({ ...data, bilingual: true })}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={!data.bilingual ? 'creative' : 'creative-outline'}
                        onClick={() => setData({ ...data, bilingual: false })}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  variant="creative-outline" 
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  variant="creative"
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedToLead()}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && data.serviceType === 'video' && (
            <div className="space-y-8 animate-slide-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-creative-dark-green mb-4">
                  Tell us about your video editing needs
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold text-creative-dark-green mb-4 block">
                      How many videos do you need per month?
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {['1–4', '5–8', '9–12', '13+'].map((option) => (
                        <Button
                          key={option}
                          variant={data.videoCount === option ? 'creative' : 'creative-outline'}
                          onClick={() => setData({ ...data, videoCount: option })}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-creative-dark-green mb-4 block">
                      Average video duration?
                    </Label>
                    <div className="space-y-3">
                      {['< 60 sec', '1–3 mins', '3–5 mins', '5+ mins'].map((option) => (
                        <Button
                          key={option}
                          variant={data.videoDuration === option ? 'creative' : 'creative-outline'}
                          onClick={() => setData({ ...data, videoDuration: option })}
                          className="w-full justify-start"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-creative-dark-green mb-4 block">
                      What editing quality do you expect?
                    </Label>
                    <div className="space-y-3">
                      <Button
                        variant={data.editingQuality === 'basic' ? 'creative' : 'creative-outline'}
                        onClick={() => setData({ ...data, editingQuality: 'basic' })}
                        className="w-full justify-start text-left"
                      >
                        <div>
                          <div className="font-semibold">Basic</div>
                          <div className="text-xs opacity-70">Subtitles, light cuts, minor SFX</div>
                        </div>
                      </Button>
                      <Button
                        variant={data.editingQuality === 'premium' ? 'creative' : 'creative-outline'}
                        onClick={() => setData({ ...data, editingQuality: 'premium' })}
                        className="w-full justify-start text-left"
                      >
                        <div>
                          <div className="font-semibold">Premium</div>
                          <div className="text-xs opacity-70">Motion graphics, sound design, branded animation</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold text-creative-dark-green mb-4 block">
                      What type of video content? (Select all that apply)
                    </Label>
                    <div className="space-y-3">
                      {videoTypeOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-3">
                          <Checkbox
                            id={option}
                            checked={data.videoTypes.includes(option)}
                            onCheckedChange={() => handleVideoTypeToggle(option)}
                          />
                          <Label htmlFor={option} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                    
                    {data.videoTypes.includes('Other') && (
                      <Input
                        placeholder="Please specify..."
                        value={data.customVideoType}
                        onChange={(e) => setData({ ...data, customVideoType: e.target.value })}
                        className="mt-3"
                      />
                    )}
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-creative-dark-green mb-4 block">
                      Do you have footage/script ready or need help?
                    </Label>
                    <div className="space-y-3">
                      <Button
                        variant={data.footageReady === 'ready' ? 'creative' : 'creative-outline'}
                        onClick={() => setData({ ...data, footageReady: 'ready' })}
                        className="w-full justify-start"
                      >
                        I have it ready
                      </Button>
                      <Button
                        variant={data.footageReady === 'need-help' ? 'creative' : 'creative-outline'}
                        onClick={() => setData({ ...data, footageReady: 'need-help' })}
                        className="w-full justify-start"
                      >
                        I need help creating it
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="captions"
                        checked={data.needCaptions}
                        onCheckedChange={(checked) => setData({ ...data, needCaptions: checked as boolean })}
                      />
                      <Label htmlFor="captions" className="cursor-pointer">
                        Do you need captions/subtitles?
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="stock"
                        checked={data.needStock}
                        onCheckedChange={(checked) => setData({ ...data, needStock: checked as boolean })}
                      />
                      <Label htmlFor="stock" className="cursor-pointer">
                        Do you need stock footage or music included?
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  variant="creative-outline" 
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  variant="creative"
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedToLead()}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-slide-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-creative-dark-green mb-4">
                  We've prepared your personalized estimate!
                </h2>
                <p className="text-muted-foreground">
                  Just enter your info to see your custom pricing
                </p>
              </div>

              <form onSubmit={handleLeadCapture} className="max-w-md mx-auto space-y-6">
                <div>
                  <Label htmlFor="name" className="text-base font-semibold text-creative-dark-green">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="mt-2"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="company" className="text-base font-semibold text-creative-dark-green">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={data.company}
                    onChange={(e) => setData({ ...data, company: e.target.value })}
                    className="mt-2"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-semibold text-creative-dark-green">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="mt-2"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-base font-semibold text-creative-dark-green">
                    Phone (optional)
                  </Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    className="mt-2"
                    placeholder="+971 50 123 4567"
                  />
                </div>

                <div className="flex justify-between pt-6">
                  <Button 
                    type="button"
                    variant="creative-outline" 
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    variant="creative"
                    size="lg"
                  >
                    Show My Custom Estimate
                    <Star className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingCalculator;