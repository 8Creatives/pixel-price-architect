import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowRight, ArrowLeft, Palette, Video, CheckCircle, Star, Phone, Award, Target, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PricingData {
  serviceType: 'graphic' | 'video' | 'both' | '';
  
  // Graphic Design Counts (as strings for inputs)
  smDesigns: string; // Social Media Designs
  banners: string; // Banners / Ad Posters
  brochures: string; // Brochures (5 pages each)
  illustrations: string; // Illustrations / Custom Graphics
  packaging: string; // Packaging / Label Designs
  otherDesignType: string; // For manual quote (not included in calc)
  bilingual: boolean; // Arabic & English surcharge
  
  // Video Editing Data (new)
  videoBasic: string; // Basic Reels
  videoMid: string; // Mid-Level Reels
  videoAdvanced: string; // Advanced Motion Graphics Reels
  videoSubtitles: boolean; // Subtitles on videos
  videoNeedsStock: boolean; // Premium stock footage/music
  videoNeedsScripting: boolean; // Concept/scripting/planning support
  
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
  estimatedHours: number;
}

const PricingCalculator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<PricingData>({
    serviceType: '',
    smDesigns: '0',
    banners: '0',
    brochures: '0',
    illustrations: '0',
    packaging: '0',
    otherDesignType: '',
    bilingual: false,
    videoBasic: '0',
    videoMid: '0',
    videoAdvanced: '0',
    videoSubtitles: false,
    videoNeedsStock: false,
    videoNeedsScripting: false,
    name: '',
    company: '',
    email: '',
    phone: ''
  });
  
  const { toast } = useToast();

  // Calculate progress based on current step
  useEffect(() => {
    const totalSteps = 3;
    const baseProgress = ((currentStep - 1) / totalSteps) * 100;
    setProgress(baseProgress);
  }, [currentStep]);

  

  // Video type options removed in favor of explicit video complexity inputs

  // Calculate hours needed based on explicit counts
  const calculateDesignHours = (): number => {
    const sm = Number(data.smDesigns || 0);
    const banners = Number(data.banners || 0);
    const brochures = Number(data.brochures || 0);
    const illustrations = Number(data.illustrations || 0);
    const packaging = Number(data.packaging || 0);
    return sm * 1 + banners * 1.5 + brochures * 5 + illustrations * 3 + packaging * 5;
  };

  const getGraphicTotals = () => {
    const sm = Number(data.smDesigns || 0);
    const banners = Number(data.banners || 0);
    const brochures = Number(data.brochures || 0);
    const illustrations = Number(data.illustrations || 0);
    const packaging = Number(data.packaging || 0);
    const totalCount = sm + banners + brochures + illustrations + packaging;
    const totalHours = sm * 1 + banners * 1.5 + brochures * 5 + illustrations * 3 + packaging * 5;
    return { sm, banners, brochures, illustrations, packaging, totalCount, totalHours };
  };

  const computeGraphicPricing = () => {
    const { totalHours } = getGraphicTotals();
    const Base_Price = 499;
    const Base_Hours = 55;
    const Extra_Hourly_Rate = 9;
    let finalPrice = Base_Price;
    if (totalHours > Base_Hours) {
      const extraHours = totalHours - Base_Hours;
      finalPrice += extraHours * Extra_Hourly_Rate;
    }
    if (data.bilingual) {
      finalPrice *= 1.1; // 10% surcharge for bilingual
    }
    return { price: Math.round(finalPrice), hours: totalHours };
  };

  const computeVideoPricing = () => {
    const basic = Number(data.videoBasic || 0);
    const mid = Number(data.videoMid || 0);
    const adv = Number(data.videoAdvanced || 0);

    const basePrice = 699;
    const baseHours = 55;
    const extraRate = 12;

    let totalHours = basic * 2.5 + mid * 5 + adv * 11;

    // Subtitles are included in basic editing; no time change

    // Pre-production/support time additions
    const totalVideos = basic + mid + adv;
    if (data.videoNeedsScripting) {
      totalHours += totalVideos * 1; // +1 hr per video
    }
    if (data.videoNeedsStock) {
      totalHours += totalVideos * 0.5; // +0.5 hr per video
    }

    let finalPrice = basePrice;
    if (totalHours > baseHours) {
      const extraHours = totalHours - baseHours;
      finalPrice += extraHours * extraRate;
    }

    return { price: Math.round(finalPrice), hours: totalHours };
  };

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
      includes: [],
      estimatedHours: 0
    };

    if (data.serviceType === 'graphic') {
      const g = computeGraphicPricing();
      result.monthlyPrice = g.price;
      result.estimatedHours = g.hours;
      result.includes.push('Graphic Design Package');
      if (data.bilingual) result.includes.push('Arabic & English designs');
    } else if (data.serviceType === 'video') {
      const v = computeVideoPricing();
      result.monthlyPrice = v.price;
      result.estimatedHours = v.hours;
      result.includes.push('Video Editing Package');
      const totalVideos = Number(data.videoBasic || 0) + Number(data.videoMid || 0) + Number(data.videoAdvanced || 0);
      if (totalVideos > 0) {
        result.includes.push(`${totalVideos} videos/month (mix of basic, mid-level, advanced)`);
      }
      if (data.videoSubtitles) result.includes.push('Subtitles included');
      if (data.videoNeedsScripting) result.includes.push('Concept, scripting & planning support');
      if (data.videoNeedsStock) result.includes.push('Premium stock footage/music licensing');
    } else if (data.serviceType === 'both') {
      const g = computeGraphicPricing();
      const v = computeVideoPricing();
      const subtotal = g.price + v.price;
      const discount = Math.round(subtotal * 0.2); // Preserve 20% bundle savings
      result.monthlyPrice = subtotal - discount;
      result.estimatedHours = g.hours + v.hours;
      result.includes.push('Complete Creative Package: Design + Video');
      result.includes.push('Bundle discount applied (20%)');
      if (data.bilingual) result.includes.push('Arabic & English designs included');
      const totalVideos = Number(data.videoBasic || 0) + Number(data.videoMid || 0) + Number(data.videoAdvanced || 0);
      if (totalVideos > 0) {
        result.includes.push(`${totalVideos} videos/month (mix of basic, mid-level, advanced)`);
      }
      if (data.videoSubtitles) result.includes.push('Subtitles included for videos');
      if (data.videoNeedsScripting) result.includes.push('Concept, scripting & planning support');
      if (data.videoNeedsStock) result.includes.push('Premium stock footage/music licensing');
    }

    return result;
  };

  const handleServiceSelect = (service: 'graphic' | 'video' | 'both') => {
    setData({ ...data, serviceType: service });
    setCurrentStep(2);
  };

  

  const handleLeadCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name || !data.company || !data.email) {
      toast({
        title: "Required Information Missing",
        description: "Please complete all required fields (Name, Company, Email) to view your estimate.",
        variant: "destructive"
      });
      return;
    }
    setProgress(100);
    setShowResults(true);
  };

  const canProceedToLead = () => {
    if (data.serviceType === 'graphic') {
      const { totalCount } = getGraphicTotals();
      return totalCount > 0 || (data.otherDesignType?.trim().length ?? 0) > 0;
    }
    if (data.serviceType === 'video') {
      const totalVideos =
        Number(data.videoBasic || 0) + Number(data.videoMid || 0) + Number(data.videoAdvanced || 0);
      return totalVideos > 0;
    }
    if (data.serviceType === 'both') {
      const { totalCount } = getGraphicTotals();
      const designRequirements = totalCount > 0 || (data.otherDesignType?.trim().length ?? 0) > 0;
      const totalVideos =
        Number(data.videoBasic || 0) + Number(data.videoMid || 0) + Number(data.videoAdvanced || 0);
      return designRequirements && totalVideos > 0;
    }
    return false;
  };

  if (showResults) {
    const pricing = calculatePricing();
    const designCount =
      Number(data.smDesigns || 0) +
      Number(data.banners || 0) +
      Number(data.brochures || 0) +
      Number(data.illustrations || 0) +
      Number(data.packaging || 0);
    const videoCount =
      Number(data.videoBasic || 0) + Number(data.videoMid || 0) + Number(data.videoAdvanced || 0);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-4xl animate-scale-in border border-gray-200 shadow-xl">
          <CardHeader className="text-center pb-8 bg-creative-dark-green text-white">
            {/* Company Logo */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-creative-yellow rounded-full mx-auto flex items-center justify-center">
                <span className="text-creative-dark-green font-black text-2xl">8C</span>
              </div>
            </div>
            
            <div className="bg-creative-yellow text-creative-dark-green px-6 py-2 rounded-full inline-block mb-4 font-bold">
              ✨ Your Creative Requirements Assessment
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold mb-4">
              {data.name}, Your Custom Plan Is Ready
            </CardTitle>
            <div className="text-creative-yellow text-lg font-semibold">
              Based on your needs: {designCount > 0 ? `${designCount} designs` : ''} 
              {designCount > 0 && videoCount > 0 ? ' & ' : ''}
              {videoCount > 0 ? `${videoCount} videos` : ''} per month
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8 p-6 sm:p-8">
            <div className="text-center bg-gradient-to-r from-creative-yellow/10 to-creative-green/10 p-6 sm:p-8 rounded-2xl">
              <div className="text-4xl sm:text-6xl font-black text-creative-dark-green mb-2">
                ${pricing.monthlyPrice.toLocaleString()}
                <span className="text-lg sm:text-xl text-muted-foreground font-normal">/month</span>
              </div>
              <p className="text-lg font-semibold text-creative-dark-green">Your Monthly Investment</p>
              <p className="text-sm text-muted-foreground mt-2">
                Professional creative services at a fraction of hiring cost
              </p>
            </div>

            <div className="bg-creative-dark-green text-white p-6 rounded-2xl">
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <Target className="mr-3 h-6 w-6 text-creative-yellow" />
                What's Included in Your Plan:
              </h3>
              <div className="grid gap-3">
                {pricing.includes.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-creative-yellow flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 mt-2 pt-2 border-t border-creative-yellow/30">
                  <TrendingUp className="h-5 w-5 text-creative-yellow flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Unlimited revisions until you're 100% satisfied</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-creative-yellow flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Dedicated creative team with 24-48 hour turnaround</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-xs text-gray-600 mb-4 italic">
                *These are estimated prices based on your requirements. We strongly recommend speaking with our team for a detailed review and final proposal tailored to your specific needs.
              </div>
              
              <div className="text-center bg-white p-6 rounded-xl border-2 border-creative-yellow">
                <h4 className="font-bold text-xl text-creative-dark-green mb-2">
                  Ready to Get Started?
                </h4>
                <p className="text-muted-foreground mb-6">
                  Get a creative strategist to review your estimate and customize your plan
                </p>
                
                <div className="space-y-4">
                  <Button 
                    variant="creative" 
                    size="lg" 
                    className="w-full text-lg font-bold py-6"
                    onClick={() => window.open('https://8creatives.zohobookings.com/#/8creatives', '_blank')}
                  >
                    <Phone className="mr-3 h-6 w-6" />
                    Book Your Strategy Call (Free)
                  </Button>
                  
                  <p className="text-xs text-gray-500">
                    💡 Free consultation with our creative strategist to refine your plan
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-4xl animate-fade-in border border-gray-200 shadow-xl">
        <CardHeader className="text-center pb-8 bg-creative-dark-green text-white">
          {/* Company Logo */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-creative-yellow rounded-full mx-auto flex items-center justify-center">
              <span className="text-creative-dark-green font-black text-3xl">8C</span>
            </div>
          </div>
          
          <CardTitle className="text-3xl sm:text-4xl font-black mb-4">
            Calculate Your Creative Plan
          </CardTitle>
          <p className="text-lg sm:text-xl text-creative-yellow max-w-3xl mx-auto font-semibold">
            Get unlimited designs & videos for less than hiring one designer
          </p>
          
          {/* Progress Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2 text-creative-yellow">
              <span>Requirements Assessment</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-creative-green/30 rounded-full h-3">
              <div 
                className="bg-creative-yellow h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-creative-dark-green mb-6">
                  What creative services do you need?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Choose the option that best fits your business needs
                </p>
              </div>
              
              <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6">
                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-creative-yellow bg-white"
                  onClick={() => handleServiceSelect('graphic')}
                >
                  <CardContent className="p-6 sm:p-8 text-center">
                    <Palette className="h-12 sm:h-16 w-12 sm:w-16 text-creative-green mx-auto mb-6" />
                    <h3 className="font-bold text-xl text-creative-dark-green mb-3">Graphic Design</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Unlimited graphics for all your marketing needs
                    </p>
                    <div className="text-xs text-creative-green font-semibold">
                      Social Media • Website Graphics • Branding
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-creative-yellow bg-white"
                  onClick={() => handleServiceSelect('video')}
                >
                  <CardContent className="p-6 sm:p-8 text-center">
                    <Video className="h-12 sm:h-16 w-12 sm:w-16 text-creative-green mx-auto mb-6" />
                    <h3 className="font-bold text-xl text-creative-dark-green mb-3">Video Editing</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Professional video editing for all platforms
                    </p>
                    <div className="text-xs text-creative-green font-semibold">
                      Reels • YouTube • Video Ads • Explainers
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-3 border-creative-yellow bg-gradient-to-br from-creative-yellow/10 to-white relative"
                  onClick={() => handleServiceSelect('both')}
                >
                  <div className="absolute -top-4 -right-4 bg-creative-yellow text-creative-dark-green px-4 py-2 rounded-full text-sm font-black">
                    SAVE 20%
                  </div>
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="flex justify-center space-x-3 mb-6">
                      <Palette className="h-10 sm:h-12 w-10 sm:w-12 text-creative-green" />
                      <Video className="h-10 sm:h-12 w-10 sm:w-12 text-creative-green" />
                    </div>
                    <h3 className="font-bold text-xl text-creative-dark-green mb-3">Complete Package</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Full creative services - design + video
                    </p>
                    <div className="text-xs text-creative-green font-semibold">
                      Everything included • Best value
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-slide-in">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-creative-dark-green mb-6">
                  {data.serviceType === 'graphic' ? 'Tell us about your design needs' : 
                   data.serviceType === 'video' ? 'Tell us about your video needs' : 
                   'Tell us about your creative needs'}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {data.serviceType === 'graphic' ? 'Help us understand your requirements so we can provide an accurate estimate' :
                   data.serviceType === 'video' ? 'Help us understand your video requirements' :
                   'Help us understand both your design and video requirements'}
                </p>
              </div>

              {/* Graphic Design Section */}
              {(data.serviceType === 'graphic' || data.serviceType === 'both') && (
                <div className="bg-creative-green/10 p-6 rounded-xl border border-creative-green/20">
                  <h3 className="text-xl font-bold mb-4 text-creative-dark-green flex items-center">
                    <Palette className="mr-3 h-6 w-6 text-creative-green" />
                    Graphic Design Requirements
                  </h3>

                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <Label className="text-lg font-bold text-creative-dark-green mb-2 block">
                        How many of each type of creative do you need per month?
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="font-semibold">Social Media Designs</Label>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            value={data.smDesigns}
                            onChange={(e) => setData({ ...data, smDesigns: e.target.value })}
                            className="mt-2 h-11"
                          />
                          
                        </div>

                        <div>
                          <Label className="font-semibold">Banners / Ad Posters</Label>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            value={data.banners}
                            onChange={(e) => setData({ ...data, banners: e.target.value })}
                            className="mt-2 h-11"
                          />
                          
                        </div>

                        <div>
                          <Label className="font-semibold">Brochures (5 pages each)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            value={data.brochures}
                            onChange={(e) => setData({ ...data, brochures: e.target.value })}
                            className="mt-2 h-11"
                          />
                        </div>

                        <div>
                          <Label className="font-semibold">Illustrations / Custom Graphics</Label>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            value={data.illustrations}
                            onChange={(e) => setData({ ...data, illustrations: e.target.value })}
                            className="mt-2 h-11"
                          />
                          
                        </div>

                        <div>
                          <Label className="font-semibold">Packaging / Label Designs</Label>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            value={data.packaging}
                            onChange={(e) => setData({ ...data, packaging: e.target.value })}
                            className="mt-2 h-11"
                          />
                          
                        </div>
                      </div>

                      <div>
                        <Label className="text-lg font-bold text-creative-dark-green">Other Design Type</Label>
                        <Input
                          placeholder="Describe other design needs"
                          value={data.otherDesignType}
                          onChange={(e) => setData({ ...data, otherDesignType: e.target.value })}
                          className="mt-2 h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Label className="text-lg font-bold text-creative-dark-green mb-2 block">
                        Will any designs need to be in Arabic & English?
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant={data.bilingual ? 'creative' : 'creative-outline'}
                          onClick={() => setData({ ...data, bilingual: true })}
                          className="h-12"
                        >
                          Yes
                        </Button>
                        <Button
                          variant={!data.bilingual ? 'creative' : 'creative-outline'}
                          onClick={() => setData({ ...data, bilingual: false })}
                          className="h-12"
                        >
                          No
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Selecting Yes adds a 10% bilingual surcharge.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Editing Section */}
              {(data.serviceType === 'video' || data.serviceType === 'both') && (
                <div className="bg-creative-green/10 p-6 rounded-xl border border-creative-green/20">
                  <h3 className="text-xl font-bold mb-4 text-creative-dark-green flex items-center">
                    <Video className="mr-3 h-6 w-6 text-creative-green" />
                    Video Editing Requirements
                  </h3>

                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <Label className="text-lg font-bold text-creative-dark-green mb-2 block">
                        How many of each type of video do you need per month?
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="font-semibold">Basic Reels</Label>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="link" className="px-0">See example</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Basic Reel Editing - Example</DialogTitle>
                                  <DialogDescription>
                                    Raw footage cleanup, captions, cut points, and light effects suitable for quick social posts.
                                  </DialogDescription>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            value={data.videoBasic}
                            onChange={(e) => setData({ ...data, videoBasic: e.target.value })}
                            className="mt-2 h-11"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="font-semibold">Mid-Level Reels</Label>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="link" className="px-0">See example</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Mid-Level Reel Editing - Example</DialogTitle>
                                  <DialogDescription>
                                    B-roll integration, branded motion, smoother transitions, and light sound design for polished content.
                                  </DialogDescription>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            value={data.videoMid}
                            onChange={(e) => setData({ ...data, videoMid: e.target.value })}
                            className="mt-2 h-11"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="font-semibold">Advanced Motion Graphics Reels</Label>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="link" className="px-0">See example</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Advanced Motion Graphics - Example</DialogTitle>
                                  <DialogDescription>
                                    Custom motion graphics, premium animation, SFX, and layered timelines for high-end campaigns.
                                  </DialogDescription>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            value={data.videoAdvanced}
                            onChange={(e) => setData({ ...data, videoAdvanced: e.target.value })}
                            className="mt-2 h-11"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <Label className="text-lg font-bold text-creative-dark-green mb-2 block">
                          Subtitles
                        </Label>
                        <div className="text-sm text-muted-foreground">Subtitles are included in all edits.</div>
                      </div>

                      <div>
                        <Label className="text-lg font-bold text-creative-dark-green mb-2 block">
                          Do you want us to use premium stock footage or music?
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant={data.videoNeedsStock ? 'creative' : 'creative-outline'}
                            onClick={() => setData({ ...data, videoNeedsStock: true })}
                            className="h-12"
                          >
                            Yes
                          </Button>
                          <Button
                            variant={!data.videoNeedsStock ? 'creative' : 'creative-outline'}
                            onClick={() => setData({ ...data, videoNeedsStock: false })}
                            className="h-12"
                          >
                            No
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-lg font-bold text-creative-dark-green mb-2 block">
                          Do you already have footage and a script ready?
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant={!data.videoNeedsScripting ? 'creative' : 'creative-outline'}
                            onClick={() => setData({ ...data, videoNeedsScripting: false })}
                            className="h-12"
                          >
                            Yes, everything is ready
                          </Button>
                          <Button
                            variant={data.videoNeedsScripting ? 'creative' : 'creative-outline'}
                            onClick={() => setData({ ...data, videoNeedsScripting: true })}
                            className="h-12"
                          >
                            No, I need help
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                <Button 
                  variant="creative-outline" 
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 sm:flex-initial"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  variant="creative"
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedToLead()}
                  className="flex-1 sm:flex-initial"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}


          {currentStep === 3 && (
            <div className="space-y-8 animate-slide-in">
              <div className="text-center mb-8 bg-creative-dark-green text-white p-6 sm:p-8 rounded-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Almost there! Let's get your estimate
                </h2>
                <p className="text-creative-yellow text-lg">
                  Enter your details to receive your customized plan
                </p>
              </div>

              <form onSubmit={handleLeadCapture} className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-lg font-bold text-creative-dark-green">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                      className="mt-3 h-12 text-lg border-2 border-creative-dark-green"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="company" className="text-lg font-bold text-creative-dark-green">Company Name *</Label>
                    <Input
                      id="company"
                      type="text"
                      value={data.company}
                      onChange={(e) => setData({ ...data, company: e.target.value })}
                      className="mt-3 h-12 text-lg border-2 border-creative-dark-green"
                      placeholder="Your company name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-lg font-bold text-creative-dark-green">Business Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      className="mt-3 h-12 text-lg border-2 border-creative-dark-green"
                      placeholder="your@company.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-lg font-bold text-creative-dark-green">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setData({ ...data, phone: e.target.value })}
                      className="mt-3 h-12 text-lg border-2 border-creative-dark-green"
                      placeholder="+971 50 000 0000"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    type="button"
                    variant="creative-outline" 
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 sm:flex-initial"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    variant="creative"
                    size="lg"
                    className="flex-1 h-14 text-xl font-bold"
                  >
                    Get My Custom Estimate
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </div>
                
                <p className="text-center text-sm text-gray-500">
                  Get instant access to your personalized creative plan
                </p>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingCalculator;