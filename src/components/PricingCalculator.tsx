import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, Palette, Video, CheckCircle, Star, Phone, Award, Target, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/8creatives-logo.png';

interface PricingData {
  serviceType: 'graphic' | 'video' | 'both' | '';
  
  // Graphic Design Data
  designPieces: string;
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
  estimatedHours: number;
}

const PricingCalculator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<PricingData>({
    serviceType: '',
    designPieces: '',
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

  // Calculate progress based on current step
  useEffect(() => {
    const totalSteps = 3;
    const baseProgress = ((currentStep - 1) / totalSteps) * 100;
    setProgress(baseProgress);
  }, [currentStep]);

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

  // Calculate hours needed based on design requirements
  const calculateDesignHours = (): number => {
    const designCount = parseInt(data.designPieces.split('–')[1] || data.designPieces.replace('+', '') || '0');
    let totalHours = 0;

    // Base calculation: 5 social media designs = 2.5 hours
    const socialMediaDesigns = data.designTypes.includes('Social Media Posts') 
      ? Math.min(designCount * 0.6, designCount * 0.8) // 60-80% are social media
      : 0;
    
    totalHours += (socialMediaDesigns / 5) * 2.5;

    // Brochures: 6-page design-heavy brochure = 4.5 hours each
    if (data.designTypes.includes('Brochures / Company Profiles')) {
      const brochureCount = Math.ceil(designCount * 0.15); // ~15% are brochures
      totalHours += brochureCount * 4.5;
    }

    // Creative tasks (Website Graphics, Packaging) take 2x time
    const creativeTypes = ['Website Graphics', 'Packaging / Labels', 'Banners / Ads'];
    const hasCreativeTasks = data.designTypes.some(type => creativeTypes.includes(type));
    
    if (hasCreativeTasks) {
      const creativeCount = Math.ceil(designCount * 0.25); // ~25% are creative tasks
      totalHours += (creativeCount / 5) * 2.5 * 2; // 2x time for creative tasks
    }

    // Minimum 2.5 hours/day (52.5 hours/month)
    return Math.max(totalHours, 52.5);
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

    if (data.serviceType === 'both') {
      // Combined package - $959 base (20% discount applied)
      result.breakdown.basePrice = 959;
      result.includes.push('Complete Creative Package: Design + Video');
      result.includes.push('Combined creative services');
      
      const designCount = parseInt(data.designPieces.split('–')[1] || data.designPieces.replace('+', '') || '0');
      const videoCount = parseInt(data.videoCount.split('–')[1] || data.videoCount.replace('+', '') || '0');
      
      result.includes.push(`Up to ${Math.max(designCount, 25)} designs/month`);
      result.includes.push(`Up to ${Math.max(videoCount, 8)} videos/month`);
      
      // Calculate estimated hours
      result.estimatedHours = calculateDesignHours() + (videoCount * 0.5); // Basic video hours estimate
      
      // Volume adjustments for combined package
      if (designCount > 25) {
        const volumeIncrease = Math.ceil((designCount - 25) / 10) * 120;
        result.breakdown.volumeAdjustment += volumeIncrease;
      }
      
      if (videoCount > 8) {
        const volumeIncrease = Math.ceil((videoCount - 8) / 4) * 160;
        result.breakdown.volumeAdjustment += volumeIncrease;
      }

      // Premium features
      if (data.editingQuality === 'premium') {
        result.breakdown.complexityAdjustment += 320;
        result.includes.push('Premium video editing with motion graphics');
      }
      
      if (data.designTypes.includes('Brochures / Company Profiles')) {
        result.breakdown.complexityAdjustment += 240;
        result.includes.push('Complex brochures & company profiles');
      }
      
      if (data.bilingual) {
        result.breakdown.bilingualBonus += 80;
        result.includes.push('Arabic & English content');
      }
      
      if (data.footageReady === 'need-help') {
        result.breakdown.addOns += 160;
        result.includes.push('Script & footage creation support');
      }
      
      if (data.needCaptions) {
        result.breakdown.addOns += 40;
        result.includes.push('Professional captions/subtitles');
      }
      
      if (data.needStock) {
        result.breakdown.addOns += 80;
        result.includes.push('Stock footage & music library');
      }
      
    } else if (data.serviceType === 'graphic') {
      // Graphic Design Only - $499 base
      result.breakdown.basePrice = 499;
      result.includes.push('Graphic Design Package');
      
      const pieceCount = parseInt(data.designPieces.split('–')[1] || data.designPieces.replace('+', '') || '0');
      result.estimatedHours = calculateDesignHours();
      
      result.includes.push(`Up to ${pieceCount} designs/month`);
      result.includes.push(`${Math.ceil(result.estimatedHours / 21)} hours/day average`);
      
      if (pieceCount > 30) {
        const volumeIncrease = Math.ceil((pieceCount - 30) / 10) * 100;
        result.breakdown.volumeAdjustment += volumeIncrease;
      }
      
      if (data.designTypes.includes('Brochures / Company Profiles')) {
        result.breakdown.complexityAdjustment += 200;
        result.includes.push('Complex brochures & company profiles');
      }
      
      // Creative tasks adjustment
      const creativeTypes = ['Website Graphics', 'Packaging / Labels'];
      const hasCreativeTasks = data.designTypes.some(type => creativeTypes.includes(type));
      if (hasCreativeTasks) {
        result.breakdown.complexityAdjustment += 150;
        result.includes.push('Creative & branding materials');
      }
      
      if (data.bilingual) {
        result.breakdown.bilingualBonus += 75;
        result.includes.push('Arabic & English designs');
      }
      
    } else if (data.serviceType === 'video') {
      // Video Editing Only - $699 base
      result.breakdown.basePrice = 699;
      result.includes.push('Video Editing Package');
      
      const videoCount = parseInt(data.videoCount.split('–')[1] || data.videoCount.replace('+', '') || '0');
      result.estimatedHours = videoCount * 0.75; // Base estimate
      
      result.includes.push(`Up to ${videoCount} videos/month`);
      result.includes.push(`${Math.ceil(result.estimatedHours / 21)} hours/day average`);
      
      if (videoCount > 10) {
        const volumeIncrease = Math.ceil((videoCount - 10) / 5) * 140;
        result.breakdown.volumeAdjustment += volumeIncrease;
      }
      
      if (data.editingQuality === 'premium') {
        result.breakdown.complexityAdjustment += 300;
        result.includes.push('Premium editing with motion graphics');
        result.estimatedHours *= 1.5; // Premium editing takes more time
      }
      
      if (data.footageReady === 'need-help') {
        result.breakdown.addOns += 150;
        result.includes.push('Script & footage creation support');
      }
      
      if (data.needCaptions) {
        result.breakdown.addOns += 50;
        result.includes.push('Professional captions/subtitles');
      }
      
      if (data.needStock) {
        result.breakdown.addOns += 75;
        result.includes.push('Stock footage & music library');
      }
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
    if (data.serviceType === 'graphic' || data.serviceType === 'both') {
      return data.designPieces && data.designTypes.length > 0;
    }
    if (data.serviceType === 'video') {
      return data.videoCount && data.videoDuration && data.videoTypes.length > 0 && data.editingQuality && data.footageReady;
    }
    return false;
  };

  if (showResults) {
    const pricing = calculatePricing();
    const designCount = parseInt(data.designPieces.split('–')[1] || data.designPieces.replace('+', '') || '0');
    const videoCount = parseInt(data.videoCount.split('–')[1] || data.videoCount.replace('+', '') || '0');
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-4xl animate-scale-in border border-gray-200 shadow-xl">
          <CardHeader className="text-center pb-8 bg-creative-dark-green text-white">
            {/* Company Logo */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto flex items-center justify-center">
                <img src={logo} alt="8Creatives" className="w-full h-full object-contain" />
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
            <div className="w-24 h-24 mx-auto flex items-center justify-center">
              <img src={logo} alt="8Creatives" className="w-full h-full object-contain" />
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

          {currentStep === 2 && (data.serviceType === 'graphic' || data.serviceType === 'both') && (
            <div className="space-y-8 animate-slide-in">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-creative-dark-green mb-6">
                  Tell us about your design needs
                </h2>
                <p className="text-lg text-muted-foreground">
                  Help us understand your requirements so we can provide an accurate estimate
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-bold text-creative-dark-green mb-6 block">
                      How many designs do you need per month?
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {['5–10', '11–20', '21–30', '30+'].map((option) => (
                        <Button
                          key={option}
                          variant={data.designPieces === option ? 'creative' : 'creative-outline'}
                          onClick={() => setData({ ...data, designPieces: option })}
                          className="justify-center h-14 text-base font-semibold"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <Label className="text-lg font-bold text-creative-dark-green mb-6 block">
                      What types of designs do you need?
                    </Label>
                    <div className="space-y-4">
                      {designTypeOptions.map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-4 cursor-pointer p-4 rounded-xl border-2 hover:border-creative-yellow hover:bg-creative-yellow/10 transition-all duration-200"
                        >
                          <Checkbox
                            checked={data.designTypes.includes(option)}
                            onCheckedChange={() => handleDesignTypeToggle(option)}
                            className="w-5 h-5"
                          />
                          <span className="font-semibold">{option}</span>
                        </label>
                      ))}
                    </div>
                    
                    {data.designTypes.includes('Other') && (
                      <Input
                        placeholder="Please specify..."
                        value={data.customDesignType}
                        onChange={(e) => setData({ ...data, customDesignType: e.target.value })}
                        className="mt-4 h-12"
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-4 p-6 border-2 rounded-xl hover:border-creative-yellow hover:bg-creative-yellow/10 transition-all cursor-pointer">
                      <Checkbox
                        checked={data.bilingual}
                        onCheckedChange={(checked) => setData({ ...data, bilingual: !!checked })}
                        className="w-6 h-6"
                      />
                      <div>
                        <Label className="font-bold text-lg text-creative-dark-green cursor-pointer">
                          Need Arabic & English versions?
                        </Label>
                        <p className="text-muted-foreground">
                          Bilingual content for wider market reach
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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

          {currentStep === 2 && data.serviceType === 'video' && (
            <div className="space-y-8 animate-slide-in">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-creative-dark-green mb-6">
                  Tell us about your video needs
                </h2>
                <p className="text-lg text-muted-foreground">
                  Help us understand your video requirements
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold text-creative-dark-green mb-4 block">
                      How many videos do you need per month?
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {['1–4', '5–8', '9–12', '13+'].map((option) => (
                        <Button
                          key={option}
                          variant={data.videoCount === option ? 'creative' : 'creative-outline'}
                          onClick={() => setData({ ...data, videoCount: option })}
                          className="h-12"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold text-creative-dark-green mb-4 block">
                      Average video duration?
                    </Label>
                    <div className="space-y-3">
                      {['< 60 sec', '1–3 mins', '3–5 mins', '5+ mins'].map((option) => (
                        <Button
                          key={option}
                          variant={data.videoDuration === option ? 'creative' : 'creative-outline'}
                          onClick={() => setData({ ...data, videoDuration: option })}
                          className="w-full justify-start h-12"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold text-creative-dark-green mb-4 block">
                      What editing quality do you expect?
                    </Label>
                    <div className="space-y-3">
                      <Button
                        variant={data.editingQuality === 'basic' ? 'creative' : 'creative-outline'}
                        onClick={() => setData({ ...data, editingQuality: 'basic' })}
                        className="w-full justify-start text-left h-auto p-4"
                      >
                        <div>
                          <div className="font-semibold">Basic Editing</div>
                          <div className="text-xs opacity-70">Subtitles, light cuts, minor effects</div>
                        </div>
                      </Button>
                      <Button
                        variant={data.editingQuality === 'premium' ? 'creative' : 'creative-outline'}
                        onClick={() => setData({ ...data, editingQuality: 'premium' })}
                        className="w-full justify-start text-left h-auto p-4"
                      >
                        <div>
                          <div className="font-semibold">Premium Editing</div>
                          <div className="text-xs opacity-70">Motion graphics, sound design, branded animations</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold text-creative-dark-green mb-4 block">
                      What type of video content? (Select all that apply)
                    </Label>
                    <div className="space-y-3">
                      {videoTypeOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                          <Checkbox
                            id={option}
                            checked={data.videoTypes.includes(option)}
                            onCheckedChange={() => handleVideoTypeToggle(option)}
                          />
                          <Label htmlFor={option} className="flex-1 cursor-pointer font-medium">
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
                    <Label className="text-lg font-semibold text-creative-dark-green mb-4 block">
                      Do you have footage/script ready?
                    </Label>
                    <div className="space-y-3">
                      <Button
                        variant={data.footageReady === 'ready' ? 'creative' : 'creative-outline'}
                        onClick={() => setData({ ...data, footageReady: 'ready' })}
                        className="w-full justify-start"
                      >
                        I have everything ready
                      </Button>
                      <Button
                        variant={data.footageReady === 'need-help' ? 'creative' : 'creative-outline'}
                        onClick={() => setData({ ...data, footageReady: 'need-help' })}
                        className="w-full justify-start"
                      >
                        I need help creating content
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
                        Need captions/subtitles?
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="stock"
                        checked={data.needStock}
                        onCheckedChange={(checked) => setData({ ...data, needStock: checked as boolean })}
                      />
                      <Label htmlFor="stock" className="cursor-pointer">
                        Need stock footage or music?
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

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