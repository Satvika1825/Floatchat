// Enhanced Visualization Agent - Multiple plots with smart FastAPI integration
import { 
    logAgentStart, 
    logAgentEnd, 
    logAgentError, 
    createSuccessResponse, 
    createErrorResponse 
} from './base-agent.js';
import axios from 'axios';
import { config } from '../env.js';

export async function visualizationAgent(profiles, interpretation, chatHistory = []) {
    const startTime = Date.now();
    
    logAgentStart('Visualization', 'enhanced visualization analysis');
    
    try {
        // Enhanced visualization analysis
        const vizAnalysis = analyzeVisualizationNeeds(interpretation, profiles, chatHistory);
        
        console.log('🔍 Visualization analysis result:', {
            shouldVisualize: vizAnalysis.shouldVisualize,
            confidence: vizAnalysis.confidence,
            reasoning: vizAnalysis.reasoning,
            recommendedPlots: vizAnalysis.recommendedPlots.length,
            profileCount: profiles.length
        });
        
        if (!vizAnalysis.shouldVisualize || profiles.length === 0) {
            const processingTime = Date.now() - startTime;
            console.log('❌ Visualization skipped:', !vizAnalysis.shouldVisualize ? 'shouldVisualize=false' : 'no profiles');
            
            // Special handling for insufficient data in trend analysis
            if (vizAnalysis.reasoning.some(r => r.includes('trend') || r.includes('Trend')) && profiles.length > 0 && profiles.length < 3) {
                return createSuccessResponse(null, {
                    confidence: 0.8,
                    message: `Found ${profiles.length} ARGO profile${profiles.length > 1 ? 's' : ''} in the region. Trend analysis requires at least 3-5 profiles across time or space to identify meaningful patterns. Consider expanding the geographic bounds or time range to gather more data points for robust trend analysis.`,
                    analysis: vizAnalysis,
                    suggestions: [
                        'Expand geographic search area (±5-10 degrees)',
                        'Increase time range to capture seasonal/annual variations',
                        'Look for profiles from different depths or seasons'
                    ]
                }, processingTime);
            }
            
            return createSuccessResponse(null, {
                confidence: 1,
                message: 'No visualization needed',
                analysis: vizAnalysis
            }, processingTime);
        }
        
        // Get optimal profile selection for visualization
        const selectedProfiles = selectProfilesForVisualization(profiles, vizAnalysis.recommendedPlots.length);
        
        // Check if trend analysis was requested but we don't have enough profiles
        const trendAnalysisRequested = vizAnalysis.reasoning.some(r => r.includes('trend') || r.includes('Trend'));
        if (trendAnalysisRequested && selectedProfiles.length < 3) {
            const processingTime = Date.now() - startTime;
            return createSuccessResponse(null, {
                confidence: 0.6,
                message: `Found ${selectedProfiles.length} ARGO profile${selectedProfiles.length > 1 ? 's' : ''} in the region. While individual profile data is available, meaningful trend analysis requires at least 3-5 profiles distributed across time or space. The single profile can show water column structure but cannot reveal temporal or spatial trends.`,
                analysis: vizAnalysis,
                suggestions: [
                    'Expand geographic bounds to capture more profiles',
                    'Include a wider time range for temporal trends',
                    'Consider analyzing water mass properties from the single profile instead'
                ],
                profileData: selectedProfiles.length === 1 ? {
                    profileId: selectedProfiles[0].profile_id,
                    location: `${selectedProfiles[0].latitude?.toFixed(3)}°N, ${selectedProfiles[0].longitude?.toFixed(3)}°E`,
                    date: selectedProfiles[0].profile_date,
                    depth: selectedProfiles[0].max_depth || 'Unknown'
                } : null
            }, processingTime);
        }

        // Generate multiple visualizations based on analysis
        const visualizations = await generateMultipleVisualizations(
            selectedProfiles, 
            vizAnalysis.recommendedPlots, 
            interpretation
        );
        
        const processingTime = Date.now() - startTime;
        logAgentEnd('Visualization', processingTime);
        
        return createSuccessResponse(visualizations, {
            confidence: 0.9,
            analysis: vizAnalysis,
            plotCount: visualizations.plots.length,
            profileCount: selectedProfiles.length
        }, processingTime);
        
    } catch (error) {
        logAgentError('Visualization', error);
        return createErrorResponse(error, null, {
            confidence: 0
        }, Date.now() - startTime);
    }
}

// Enhanced visualization needs analysis
function analyzeVisualizationNeeds(interpretation, profiles, chatHistory) {
    const analysis = {
        shouldVisualize: false,
        confidence: 0,
        recommendedPlots: [],
        reasoning: [],
        dataAvailability: analyzeDataAvailability(profiles)
    };
    
    // Check explicit visualization requests
    const visualizationIntents = ['plot', 'compare', 'analyze', 'visualize'];
    const visualizationKeywords = ['plot', 'graph', 'chart', 'show', 'display', 'visualize', 'plots', 'trend', 'trends', 'pattern', 'variation', 'changes', 'analysis'];
    
    if (visualizationIntents.includes(interpretation.intent)) {
        analysis.shouldVisualize = true;
        analysis.confidence += 0.4;
        analysis.reasoning.push(`Intent: ${interpretation.intent}`);
    }
    
    // Check search terms for visualization keywords
    if (interpretation.search_terms) {
        const searchLower = Array.isArray(interpretation.search_terms) 
            ? interpretation.search_terms.join(' ').toLowerCase()
            : interpretation.search_terms.toLowerCase();
        
        const foundKeywords = visualizationKeywords.filter(keyword => searchLower.includes(keyword));
        
        if (foundKeywords.length > 0) {
            analysis.shouldVisualize = true;
            analysis.confidence += 0.3;
            analysis.reasoning.push(`Keywords: ${foundKeywords.join(', ')}`);
            
            // Special handling for "plots" (plural) or trend analysis
            if (searchLower.includes('plots') || searchLower.includes('multiple')) {
                analysis.confidence += 0.2;
                analysis.reasoning.push('Multiple plots requested');
            }
            
            if (searchLower.includes('trend') || searchLower.includes('trends')) {
                analysis.confidence += 0.4;
                analysis.reasoning.push('Trend analysis requires visualization');
            }
        }
    }
    
    // Strong trigger for trend analysis
    if (interpretation.parameters?.analysis_type === 'trend analysis') {
        analysis.shouldVisualize = true;
        analysis.confidence = Math.max(analysis.confidence, 0.9);
        analysis.reasoning.push('Trend analysis requires data visualization');
    }
    
    // Determine recommended plot types based on data and request
    analysis.recommendedPlots = determineRecommendedPlots(interpretation, profiles, chatHistory, analysis.dataAvailability);
    
    // Adjust confidence based on data availability
    if (analysis.dataAvailability.overallQuality > 0.7) {
        analysis.confidence += 0.1;
    }
    
    return analysis;
}

function analyzeDataAvailability(profiles) {
    const availability = {
        hasTemperature: 0,
        hasSalinity: 0,
        hasDepth: 0,
        hasOxygen: 0,
        profileCount: profiles.length,
        overallQuality: 0
    };
    
    if (profiles.length === 0) return availability;
    
    profiles.forEach(p => {
        // Check for temperature data (multiple possible field names)
        if (p.temperature !== null && p.temperature !== undefined) {
            availability.hasTemperature++;
        } else if (p.temp !== null && p.temp !== undefined) {
            availability.hasTemperature++;
        } else if (p.measurements && p.measurements.temperature) {
            availability.hasTemperature++;
        }
        
        // Check for salinity data (multiple possible field names) 
        if (p.salinity !== null && p.salinity !== undefined) {
            availability.hasSalinity++;
        } else if (p.sal !== null && p.sal !== undefined) {
            availability.hasSalinity++;
        } else if (p.measurements && p.measurements.salinity) {
            availability.hasSalinity++;
        }
        
        // Check for depth data
        if (p.depth !== null && p.depth !== undefined) {
            availability.hasDepth++;
        } else if (p.max_depth !== null && p.max_depth !== undefined) {
            availability.hasDepth++;
        } else if (p.measurements && p.measurements.depth) {
            availability.hasDepth++;
        }
        
        // Check for oxygen data
        if (p.oxygen !== null && p.oxygen !== undefined) {
            availability.hasOxygen++;
        } else if (p.measurements && p.measurements.oxygen) {
            availability.hasOxygen++;
        }
    });
    
    // Convert to percentages
    const total = profiles.length;
    availability.hasTemperature /= total;
    availability.hasSalinity /= total;
    availability.hasDepth /= total;
    availability.hasOxygen /= total;
    
    // For ARGO float data, assume high availability if profiles exist
    // ARGO floats typically always measure temperature and salinity
    if (total > 0 && availability.hasTemperature === 0 && availability.hasSalinity === 0) {
        console.log('🔍 No direct T/S data found in profiles, assuming ARGO standard measurements');
        availability.hasTemperature = 1.0; // ARGO floats always have temperature
        availability.hasSalinity = 1.0;   // ARGO floats always have salinity  
        availability.hasDepth = 1.0;      // ARGO floats always have depth
    }
    
    // Calculate overall quality score
    availability.overallQuality = (
        availability.hasTemperature + 
        availability.hasSalinity + 
        availability.hasDepth + 
        availability.hasOxygen
    ) / 4;
    
    console.log('📊 Data availability analysis:', {
        profiles: total,
        temperature: Math.round(availability.hasTemperature * 100) + '%',
        salinity: Math.round(availability.hasSalinity * 100) + '%',
        quality: Math.round(availability.overallQuality * 100) + '%'
    });
    
    return availability;
}

function determineRecommendedPlots(interpretation, profiles, chatHistory, dataAvailability) {
    const plots = [];
    const searchLower = Array.isArray(interpretation.search_terms) 
        ? interpretation.search_terms.join(' ').toLowerCase()
        : (interpretation.search_terms?.toLowerCase() || '');
    const previousPlots = extractPreviousPlotTypes(chatHistory);
    
    // Priority 1: Explicit plot type from interpretation
    if (interpretation.plot_type) {
        plots.push({
            type: interpretation.plot_type,
            priority: 1,
            reasoning: 'Explicitly requested'
        });
    }
    
    // Priority 2: Multiple plots requested
    if (searchLower.includes('plots') || searchLower.includes('multiple')) {
        // Add complementary plot types based on available data
        if (dataAvailability.hasTemperature > 0.5) {
            plots.push({
                type: 'temperature',
                priority: 2,
                reasoning: 'Temperature data available for multiple plots request'
            });
        }
        
        if (dataAvailability.hasSalinity > 0.5) {
            plots.push({
                type: 'salinity',
                priority: 2,
                reasoning: 'Salinity data available for multiple plots request'
            });
        }
        
        if (dataAvailability.hasTemperature > 0.5 && dataAvailability.hasSalinity > 0.5) {
            plots.push({
                type: 'ts_diagram',
                priority: 2,
                reasoning: 'T-S diagram for comprehensive analysis'
            });
        }
    }
    
    // Priority 3: Context-based recommendations
    if (interpretation.intent === 'compare') {
        if (dataAvailability.hasTemperature > 0.5 && dataAvailability.hasSalinity > 0.5) {
            plots.push({
                type: 'ts_diagram',
                priority: 3,
                reasoning: 'T-S diagram optimal for comparison'
            });
        }
    }
    
    // Priority 4: Search term analysis
    if (searchLower.includes('profile') || searchLower.includes('depth')) {
        plots.push({
            type: 'depth_profile',
            priority: 4,
            reasoning: 'Depth profile requested'
        });
    }
    
    if (searchLower.includes('temperature')) {
        plots.push({
            type: 'temperature',
            priority: 4,
            reasoning: 'Temperature analysis requested'
        });
    }
    
    if (searchLower.includes('salinity')) {
        plots.push({
            type: 'salinity',
            priority: 4,
            reasoning: 'Salinity analysis requested'
        });
    }
    
    // Special handling for trend analysis - always generate both temperature and salinity
    if (searchLower.includes('trend') || searchLower.includes('trends') || interpretation.parameters?.analysis_type === 'trend analysis') {
        if (dataAvailability.hasTemperature > 0.5 && !plots.some(p => p.type === 'temperature')) {
            plots.push({
                type: 'temperature',
                priority: 2,
                reasoning: 'Temperature trends analysis requires temperature plot'
            });
        }
        
        if (dataAvailability.hasSalinity > 0.5 && !plots.some(p => p.type === 'salinity')) {
            plots.push({
                type: 'salinity', 
                priority: 2,
                reasoning: 'Salinity trends analysis requires salinity plot'
            });
        }
        
        // For trend analysis with both variables, add T-S diagram
        if (dataAvailability.hasTemperature > 0.5 && dataAvailability.hasSalinity > 0.5 && !plots.some(p => p.type === 'ts_diagram')) {
            plots.push({
                type: 'ts_diagram',
                priority: 2,
                reasoning: 'T-S diagram shows relationship between temperature and salinity trends'
            });
        }
    }
    
    // Priority 5: Data-driven defaults
    if (plots.length === 0) {
        if (dataAvailability.hasTemperature > 0.7) {
            plots.push({
                type: 'temperature',
                priority: 5,
                reasoning: 'High quality temperature data available'
            });
        }
        
        if (dataAvailability.hasSalinity > 0.7) {
            plots.push({
                type: 'salinity',
                priority: 5,
                reasoning: 'High quality salinity data available'
            });
        }
    }
    
    // Remove duplicates and sort by priority
    const uniquePlots = plots.reduce((acc, plot) => {
        if (!acc.some(p => p.type === plot.type)) {
            acc.push(plot);
        }
        return acc;
    }, []);
    
    return uniquePlots.sort((a, b) => a.priority - b.priority).slice(0, 4); // Max 4 plots
}

function extractPreviousPlotTypes(chatHistory) {
    if (!chatHistory || chatHistory.length === 0) return [];
    
    const plotTypes = [];
    chatHistory.forEach(msg => {
        const response = msg.ai_response.toLowerCase();
        if (response.includes('temperature plot')) plotTypes.push('temperature');
        if (response.includes('salinity plot')) plotTypes.push('salinity');
        if (response.includes('depth profile')) plotTypes.push('depth_profile');
        if (response.includes('ts diagram') || response.includes('t-s diagram')) plotTypes.push('ts_diagram');
    });
    
    return plotTypes;
}

function selectProfilesForVisualization(profiles, plotCount = 1) {
    // Adjust profile count based on number of plots
    const maxProfilesPerPlot = Math.max(3, Math.floor(8 / plotCount));
    const maxProfiles = Math.min(profiles.length, maxProfilesPerPlot);
    
    if (profiles.length <= maxProfiles) {
        return profiles;
    }
    
    // Enhanced scoring system
    const scoredProfiles = profiles.map(profile => {
        let score = 0;
        
        // Data completeness (40% weight)
        let completeness = 0;
        if (profile.temperature !== null) completeness += 0.25;
        if (profile.salinity !== null) completeness += 0.25;
        if (profile.depth !== null) completeness += 0.25;
        if (profile.oxygen !== null) completeness += 0.25;
        score += completeness * 40;
        
        // Recent data bonus (30% weight)
        if (profile.profile_date) {
            const date = new Date(profile.profile_date);
            const now = new Date();
            const ageInYears = (now - date) / (1000 * 60 * 60 * 24 * 365);
            const recencyScore = Math.max(0, (5 - ageInYears) / 5); // Normalize to 0-1
            score += recencyScore * 30;
        }
        
        // Quality flag bonus (20% weight)
        if (profile.quality_flag === 'A' || profile.quality_flag === 1) {
            score += 20;
        } else if (profile.quality_flag === 'B' || profile.quality_flag === 2) {
            score += 10;
        }
        
        // Geographic diversity bonus (10% weight)
        // This would require more complex logic, simplified here
        if (profile.latitude && profile.longitude) {
            score += 10;
        }
        
        return { ...profile, visualizationScore: score };
    });
    
    // Sort by score and take top profiles
    return scoredProfiles
        .sort((a, b) => b.visualizationScore - a.visualizationScore)
        .slice(0, maxProfiles);
}

async function generateMultipleVisualizations(profiles, recommendedPlots, interpretation) {
    const visualizations = {
        plots: [],
        metadata: {
            totalPlots: recommendedPlots.length,
            profileIds: profiles.map(p => p.profile_id),
            analysisType: 'multiple'
        }
    };
    
    const profileIds = profiles.map(p => p.profile_id);
    console.log(`📊 Generating ${recommendedPlots.length} visualizations for ${profiles.length} profiles`);
    
    // Use efficient multiple plot endpoint if more than 1 plot requested
    if (recommendedPlots.length > 1) {
        try {
            const multiplePlotsData = await createMultipleVisualizationsEfficient(
                profileIds,
                recommendedPlots.map(p => p.type),
                interpretation
            );
            
            // Map the efficient results back to our structure
            multiplePlotsData.plots.forEach((plotData, index) => {
                if (plotData.success && plotData.data) {
                    // Parse the plot data if it's in FastAPI JSON format
                    let processedData = plotData.data;
                    if (typeof plotData.data === 'string') {
                        try {
                            const parsedData = JSON.parse(plotData.data);
                            // Keep the complete Plotly structure (data + layout)
                            processedData = parsedData;
                        } catch (e) {
                            console.warn(`Could not parse plot data for ${plotData.type}:`, e);
                        }
                    }
                    
                    visualizations.plots.push({
                        type: plotData.type,
                        data: processedData,
                        reasoning: recommendedPlots[index].reasoning,
                        priority: recommendedPlots[index].priority,
                        title: generatePlotTitle(plotData.type, profiles.length)
                    });
                    console.log(`✅ Generated ${plotData.type} plot successfully (efficient)`);
                } else {
                    console.error(`❌ Failed to generate ${plotData.type} plot: ${plotData.error}`);
                }
            });
            
        } catch (error) {
            console.error('❌ Efficient multiple plot generation failed, falling back to individual calls:', error.message);
            // Fallback to individual calls
            return await generateMultipleVisualizationsIndividual(profiles, recommendedPlots, interpretation);
        }
    } else {
        // Single plot - use individual call
        return await generateMultipleVisualizationsIndividual(profiles, recommendedPlots, interpretation);
    }
    
    return visualizations;
}

// Efficient multiple plot generation using new FastAPI endpoint
async function createMultipleVisualizationsEfficient(profileIds, plotTypes, interpretation) {
    try {
        const requestPayload = {
            profile_ids: profileIds,
            plot_types: plotTypes,
            format: 'json',
            binary_encoding: false  // Explicitly request regular JSON arrays
        };
        
        console.log(`📊 Creating multiple visualizations efficiently`, {
            profiles: profileIds.length,
            plots: plotTypes.length, 
            types: plotTypes.join(', ')
        });
        
        const response = await axios.post(`${config.FASTAPI_URL}/plot_profiles_multiple`, requestPayload);
        
        return response.data;
        
    } catch (error) {
        console.error(`❌ Efficient multiple visualization creation error:`, error.message);
        throw error;
    }
}

// Individual plot generation (fallback method)
async function generateMultipleVisualizationsIndividual(profiles, recommendedPlots, interpretation) {
    const visualizations = {
        plots: [],
        metadata: {
            totalPlots: recommendedPlots.length,
            profileIds: profiles.map(p => p.profile_id),
            analysisType: 'individual'
        }
    };
    
    console.log(`📊 Generating ${recommendedPlots.length} visualizations individually for ${profiles.length} profiles`);
    
    // Generate each recommended plot individually
    for (const plotRecommendation of recommendedPlots) {
        try {
            const plotData = await createSingleVisualization(
                profiles.map(p => p.profile_id), 
                plotRecommendation.type,
                interpretation
            );
            
            visualizations.plots.push({
                type: plotRecommendation.type,
                data: plotData,
                reasoning: plotRecommendation.reasoning,
                priority: plotRecommendation.priority,
                title: generatePlotTitle(plotRecommendation.type, profiles.length)
            });
            
            console.log(`✅ Generated ${plotRecommendation.type} plot successfully`);
            
        } catch (error) {
            console.error(`❌ Failed to generate ${plotRecommendation.type} plot:`, error.message);
            // Continue with other plots even if one fails
        }
    }
    
    return visualizations;
}

async function createSingleVisualization(profileIds, plotType, interpretation) {
    try {
        const requestPayload = {
            profile_ids: profileIds,
            plot_type: plotType,
            format: 'json',
            binary_encoding: false  // Explicitly request regular JSON arrays
        };
        
        console.log(`📊 Creating ${plotType} visualization`, {
            profiles: profileIds.length,
            format: 'json',
            payload: requestPayload
        });
        
        const response = await axios.post(`${config.FASTAPI_URL}/plot_profiles`, requestPayload);
        
        console.log(`📊 FastAPI response for ${plotType}:`, response.data);
        
        // Parse the JSON response from FastAPI
        if (response.data && response.data.plot_json) {
            const plotlyData = JSON.parse(response.data.plot_json);
            console.log(`📊 Parsed Plotly data for ${plotType}:`, plotlyData);
            return plotlyData; // Return the complete Plotly structure (data + layout)
        }
        
        return response.data;
        
    } catch (error) {
        console.error(`❌ Visualization creation error for ${plotType}:`, error.message);
        throw error;
    }
}

function generatePlotTitle(plotType, profileCount) {
    const plotTitles = {
        'temperature': `Temperature Profile${profileCount > 1 ? 's' : ''} (${profileCount} profile${profileCount > 1 ? 's' : ''})`,
        'salinity': `Salinity Profile${profileCount > 1 ? 's' : ''} (${profileCount} profile${profileCount > 1 ? 's' : ''})`,
        'depth_profile': `Ocean Depth Profile${profileCount > 1 ? 's' : ''} (${profileCount} profile${profileCount > 1 ? 's' : ''})`,
        'ts_diagram': `Temperature-Salinity Diagram (${profileCount} profile${profileCount > 1 ? 's' : ''})`
    };
    
    return plotTitles[plotType] || `Ocean Data Visualization (${profileCount} profile${profileCount > 1 ? 's' : ''})`;
}

// Enhanced visualization suggestions
export function generateVisualizationSuggestions(profiles, interpretation, existingPlots = []) {
    const suggestions = [];
    const dataAvailability = analyzeDataAvailability(profiles);
    const existingTypes = existingPlots.map(p => p.type);
    
    // Suggest complementary visualizations
    if (dataAvailability.hasTemperature > 0.5 && !existingTypes.includes('temperature')) {
        suggestions.push({
            type: 'temperature',
            description: 'Temperature depth profiles to show thermal structure',
            confidence: 0.8
        });
    }
    
    if (dataAvailability.hasSalinity > 0.5 && !existingTypes.includes('salinity')) {
        suggestions.push({
            type: 'salinity',
            description: 'Salinity depth profiles to analyze water masses',
            confidence: 0.8
        });
    }
    
    if (dataAvailability.hasTemperature > 0.5 && dataAvailability.hasSalinity > 0.5 && !existingTypes.includes('ts_diagram')) {
        suggestions.push({
            type: 'ts_diagram',
            description: 'T-S diagram to identify water mass characteristics',
            confidence: 0.9
        });
    }
    
    if (profiles.length > 3 && !existingTypes.includes('statistical_summary')) {
        suggestions.push({
            type: 'statistical_summary',
            description: 'Statistical comparison of multiple profiles',
            confidence: 0.7
        });
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
}