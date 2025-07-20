import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, Palette, Video, CheckCircle, Star, Phone, Award, Target, TrendingUp } from 'lucide-react';
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
  const [progress, setProgress] = useState(0);
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

  // Calculate progress based on current step and completion
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

    if (data.serviceType === 'both') {
      // Combined package - $959 base (20% discount applied)
      result.breakdown.basePrice = 959;
      result.includes.push('POWER COMBO: Design + Video Package');
      result.includes.push('4+ hours combined creative work/day');
      result.includes.push('Up to 25 designs/month');
      result.includes.push('Up to 8 videos/month');
      
      // Volume adjustments for combined package
      const designCount = parseInt(data.designPieces.split('–')[1] || data.designPieces.replace('+', '') || '0');
      const videoCount = parseInt(data.videoCount.split('–')[1] || data.videoCount.replace('+', '') || '0');
      
      if (designCount > 25) {
        const volumeIncrease = Math.ceil((designCount - 25) / 10) * 120; // 20% discount
        result.breakdown.volumeAdjustment += volumeIncrease;
      }
      
      if (videoCount > 8) {
        const volumeIncrease = Math.ceil((videoCount - 8) / 4) * 160; // 20% discount
        result.breakdown.volumeAdjustment += volumeIncrease;
      }

      // Premium features
      if (data.editingQuality === 'premium') {
        result.breakdown.complexityAdjustment += 320; // 20% discount
        result.includes.push('Premium video editing with motion graphics');
      }
      
      if (data.designTypes.includes('Brochures / Company Profiles')) {
        result.breakdown.complexityAdjustment += 240; // 20% discount
        result.includes.push('Complex brochures & company profiles');
      }
      
      if (data.bilingual) {
        result.breakdown.bilingualBonus += 80; // 20% discount
        result.includes.push('Arabic & English content');
      }
      
      if (data.footageReady === 'need-help') {
        result.breakdown.addOns += 160; // 20% discount
        result.includes.push('Script & footage creation support');
      }
      
      if (data.needCaptions) {
        result.breakdown.addOns += 40; // 20% discount
        result.includes.push('Professional captions/subtitles');
      }
      
      if (data.needStock) {
        result.breakdown.addOns += 80; // 20% discount
        result.includes.push('Stock footage & music library');
      }
      
    } else if (data.serviceType === 'graphic') {
      // Graphic Design Only - $599 base
      result.breakdown.basePrice = 599;
      result.includes.push('Design Domination Package');
      result.includes.push('3+ hours design work/day');
      result.includes.push('Up to 30 social-style designs/month');
      
      const pieceCount = parseInt(data.designPieces.split('–')[1] || data.designPieces.replace('+', '') || '0');
      if (pieceCount > 30) {
        const volumeIncrease = Math.ceil((pieceCount - 30) / 10) * 150;
        result.breakdown.volumeAdjustment += volumeIncrease;
      }
      
      if (data.designHours.includes('5+')) {
        result.breakdown.complexityAdjustment += 300;
        result.includes.push('Premium 5+ hours/day commitment');
      }
      
      if (data.designTypes.includes('Brochures / Company Profiles')) {
        result.breakdown.complexityAdjustment += 300;
        result.includes.push('Complex brochures & company profiles');
      }
      
      if (data.bilingual) {
        result.breakdown.bilingualBonus += 100;
        result.includes.push('Arabic & English designs');
      }
      
    } else if (data.serviceType === 'video') {
      // Video Editing Only - $799 base
      result.breakdown.basePrice = 799;
      result.includes.push('Video Victory Package');
      result.includes.push('3+ hours editing/day');
      result.includes.push('Up to 10 videos/month');
      
      const videoCount = parseInt(data.videoCount.split('–')[1] || data.videoCount.replace('+', '') || '0');
      if (videoCount > 10) {
        const volumeIncrease = Math.ceil((videoCount - 10) / 5) * 200;
        result.breakdown.volumeAdjustment += volumeIncrease;
      }
      
      if (data.editingQuality === 'premium') {
        result.breakdown.complexityAdjustment += 400;
        result.includes.push('Premium editing with motion graphics');
      }
      
      if (data.footageReady === 'need-help') {
        result.breakdown.addOns += 200;
        result.includes.push('Script & footage creation support');
      }
      
      if (data.needCaptions) {
        result.breakdown.addOns += 50;
        result.includes.push('Professional captions/subtitles');
      }
      
      if (data.needStock) {
        result.breakdown.addOns += 100;
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
        description: "Please complete all required fields (Name, Company, Email) to unlock your power estimate.",
        variant: "destructive"
      });
      return;
    }
    setProgress(100);
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
    const designCount = parseInt(data.designPieces.split('–')[1] || data.designPieces.replace('+', '') || '0');
    const videoCount = parseInt(data.videoCount.split('–')[1] || data.videoCount.replace('+', '') || '0');
    
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="w-full max-w-3xl animate-scale-in border-2 border-creative-dark-green shadow-2xl">
          <CardHeader className="text-center pb-8 bg-creative-dark-green text-white">
            <div className="w-20 h-20 bg-creative-yellow rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Award className="h-10 w-10 text-creative-dark-green" />
            </div>
            <div className="bg-creative-yellow text-creative-dark-green px-6 py-2 rounded-full inline-block mb-4 font-bold">
              🎯 Creative IQ Assessment Complete
            </div>
            <CardTitle className="text-3xl font-bold mb-4">
              {data.name}, Your Creative Power Plan Is Ready
            </CardTitle>
            <div className="text-creative-yellow text-lg font-semibold">
              Analysis: You need {designCount > 0 ? `${designCount} designs` : ''} 
              {designCount > 0 && videoCount > 0 ? ' & ' : ''}
              {videoCount > 0 ? `${videoCount} videos` : ''}/month
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8 p-8">
            <div className="text-center bg-gradient-to-r from-creative-yellow/10 to-creative-green/10 p-8 rounded-2xl">
              <div className="text-6xl font-black text-creative-dark-green mb-2">
                ${pricing.monthlyPrice.toLocaleString()}
                <span className="text-xl text-muted-foreground font-normal">/month</span>
              </div>
              <p className="text-lg font-semibold text-creative-dark-green">Your Domination Investment</p>
              <p className="text-sm text-muted-foreground mt-2">
                Unlock unlimited creative firepower at a fraction of hiring cost
              </p>
            </div>

            <div className="bg-creative-dark-green text-white p-6 rounded-2xl">
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <Target className="mr-3 h-6 w-6 text-creative-yellow" />
                Your Creative Arsenal Includes:
              </h3>
              <div className="grid gap-3">
                {pricing.includes.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-creative-yellow flex-shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-creative-yellow/30">
                  <TrendingUp className="h-5 w-5 text-creative-yellow flex-shrink-0" />
                  <span className="font-medium">Unlimited revisions until you're 100% satisfied</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-xs text-gray-500 mb-4 italic">
                *These are estimated prices based on your requirements. We strongly recommend speaking with our creative strategist team for a detailed review and final proposal tailored to your specific needs.
              </div>
              
              <div className="text-center bg-white p-6 rounded-xl border-2 border-creative-yellow">
                <h4 className="font-bold text-xl text-creative-dark-green mb-2">
                  Ready to Dominate Your Market?
                </h4>
                <p className="text-muted-foreground mb-6">
                  Get a creative strategist to review your estimate and unlock exclusive bonuses
                </p>
                
                <div className="space-y-4">
                  <Button 
                    variant="creative" 
                    size="lg" 
                    className="w-full text-lg font-bold py-6"
                    onClick={() => window.open('https://calendly.com/8creatives', '_blank')}
                  >
                    <Phone className="mr-3 h-6 w-6" />
                    Claim Your Strategy Session (FREE)
                  </Button>
                  
                  <p className="text-xs text-gray-500">
                    💡 Bonus: First 10 callers get a FREE brand audit ($500 value)
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
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl animate-fade-in border-2 border-creative-dark-green shadow-2xl">
        <CardHeader className="text-center pb-8 bg-creative-dark-green text-white">
          <CardTitle className="text-4xl font-black mb-4">
            Stop Paying Premium Prices for Average Creative
          </CardTitle>
          <p className="text-xl text-creative-yellow max-w-3xl mx-auto font-semibold">
            Calculate your custom creative domination plan. Get unlimited designs & videos for less than one freelancer.
          </p>
          
          {/* Progress Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2 text-creative-yellow">
              <span>Creative Power Assessment</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-creative-green/30 rounded-full h-3">
              <div 
                className="bg-creative-yellow h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-3">
                {[1, 2, 3].map((step) => (
                  <div 
                    key={step}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      step <= currentStep ? 'bg-creative-yellow' : 'bg-creative-green/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-creative-dark-green mb-6">
                  Which creative weapon will dominate your market?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Choose your path to creative domination. Each option unlocks massive value.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-creative-yellow bg-white"
                  onClick={() => handleServiceSelect('graphic')}
                >
                  <CardContent className="p-8 text-center relative">
                    <div className="absolute top-4 right-4 text-creative-green text-sm font-semibold">
                      $599/mo
                    </div>
                    <Palette className="h-16 w-16 text-creative-green mx-auto mb-6" />
                    <h3 className="font-bold text-xl text-creative-dark-green mb-3">Design Domination</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Unlimited graphics that convert viewers into customers
                    </p>
                    <div className="text-xs text-creative-green font-semibold">
                      • Social Media Posts • Website Graphics • Branding Materials
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-creative-yellow bg-white"
                  onClick={() => handleServiceSelect('video')}
                >
                  <CardContent className="p-8 text-center relative">
                    <div className="absolute top-4 right-4 text-creative-green text-sm font-semibold">
                      $799/mo
                    </div>
                    <Video className="h-16 w-16 text-creative-green mx-auto mb-6" />
                    <h3 className="font-bold text-xl text-creative-dark-green mb-3">Video Victory</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Viral-ready videos that command attention and drive action
                    </p>
                    <div className="text-xs text-creative-green font-semibold">
                      • Reels & TikToks • YouTube Videos • Video Ads
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-3 border-creative-yellow bg-gradient-to-br from-creative-yellow/10 to-white relative"
                  onClick={() => handleServiceSelect('both')}
                >
                  <div className="absolute -top-4 -right-4 bg-creative-yellow text-creative-dark-green px-4 py-2 rounded-full text-sm font-black animate-pulse">
                    20% OFF!
                  </div>
                  <CardContent className="p-8 text-center">
                    <div className="text-creative-green text-lg font-bold mb-2">
                      $959/mo
                      <span className="text-sm line-through text-gray-400 ml-2">$1,198</span>
                    </div>
                    <div className="flex justify-center space-x-3 mb-6">
                      <Palette className="h-12 w-12 text-creative-green" />
                      <Video className="h-12 w-12 text-creative-green" />
                    </div>
                    <h3 className="font-bold text-xl text-creative-dark-green mb-3">POWER COMBO</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Complete creative arsenal - design + video domination
                    </p>
                    <div className="text-xs text-creative-green font-semibold">
                      Save $239/month • Maximum Market Impact
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 2 && (data.serviceType === 'graphic' || data.serviceType === 'both') && (
            <div className="space-y-8 animate-slide-in">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-creative-dark-green mb-6">
                  Size Your Design Empire
                </h2>
                <p className="text-lg text-muted-foreground">
                  The more you dominate, the better value you get. Scale like a champion.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label className="text-xl font-bold text-creative-dark-green mb-6 block">
                      How many designs will fuel your domination?
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {['5–10', '11–20', '21–30', '30+'].map((option) => (
                        <Button
                          key={option}
                          variant={data.designPieces === option ? 'creative' : 'creative-outline'}
                          onClick={() => setData({ ...data, designPieces: option })}
                          className="justify-center h-16 text-lg font-bold"
                        >
                          {option}
                          <div className="text-xs opacity-70 mt-1">per month</div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xl font-bold text-creative-dark-green mb-6 block">
                      Design intensity level?
                    </Label>
                    <div className="space-y-4">
                      {[
                        { value: '2.5', label: 'Standard Power', desc: '2.5 hours/day commitment' },
                        { value: '3–4', label: 'High Impact', desc: '3-4 hours/day domination' },
                        { value: '5+', label: 'Maximum Force', desc: '5+ hours/day takeover' }
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={data.designHours === option.value ? 'creative' : 'creative-outline'}
                          onClick={() => setData({ ...data, designHours: option.value })}
                          className="w-full justify-start h-auto p-4 text-left"
                        >
                          <div>
                            <div className="font-bold text-lg">{option.label}</div>
                            <div className="text-sm opacity-70">{option.desc}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <Label className="text-xl font-bold text-creative-dark-green mb-6 block">
                      Your creative weapons of choice?
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
                          <span className="font-semibold text-lg">{option}</span>
                        </label>
                      ))}
                    </div>
                    
                    {data.designTypes.includes('Other') && (
                      <Input
                        placeholder="Describe your secret design weapon..."
                        value={data.customDesignType}
                        onChange={(e) => setData({ ...data, customDesignType: e.target.value })}
                        className="mt-4 h-12 text-lg"
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
                          Bilingual Market Domination?
                        </Label>
                        <p className="text-muted-foreground">
                          Arabic + English = 2x market penetration power
                        </p>
                      </div>
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
              <div className="text-center mb-8 bg-creative-dark-green text-white p-8 rounded-2xl">
                <h2 className="text-3xl font-bold mb-4">
                  🔥 Your Power Estimate is 99% Ready
                </h2>
                <p className="text-creative-yellow text-lg">
                  Unlock your custom creative domination plan in the next 30 seconds
                </p>
              </div>

              <form onSubmit={handleLeadCapture} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-lg font-bold text-creative-dark-green">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                      className="mt-3 h-12 text-lg border-2 border-creative-dark-green"
                      placeholder="Your name"
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
                      placeholder="Your company"
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
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    variant="creative"
                    size="lg"
                    className="flex-2 h-16 text-xl font-black"
                  >
                    🚀 UNLOCK MY CREATIVE POWER PLAN
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </div>
                
                <p className="text-center text-sm text-gray-500">
                  💡 Get instant access to your personalized creative strategy + exclusive bonuses
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