import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import MedicalRecord from '@/models/MedicalRecord';
import AIConversation from '@/models/AIConversation';
import Doctor from '@/models/Doctor';
import Appointment from '@/models/Appointment';

export async function GET(request: NextRequest) {
  try {
    // Establish MongoDB connection
    await connectToDatabase();
    
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get user's medical record
    const medicalRecord = await MedicalRecord.findOne({ user: user._id });
    
    // Get user's AI conversations
    const aiConversations = await AIConversation.find({ user: user._id });
    
    // Get connected doctors
    const connectedDoctors = medicalRecord ? 
      medicalRecord.connectedDoctors.filter((connection: { status: string }) => connection.status === 'approved').length : 0;
    
    // Calculate health metrics from medical record data
    const calculateBMI = () => {
      if (medicalRecord?.personalInfo?.height && medicalRecord?.personalInfo?.weight) {
        // BMI = weight (kg) / (height (m))^2
        const heightInMeters = medicalRecord.personalInfo.height / 100;
        return (medicalRecord.personalInfo.weight / (heightInMeters * heightInMeters)).toFixed(1);
      }
      return null;
    };
    
    // Count active medications
    const activeMedications = medicalRecord ? 
      medicalRecord.medications.filter((med: { endDate?: Date }) => {
        const endDate = med.endDate ? new Date(med.endDate) : null;
        return !endDate || endDate > new Date();
      }).length : 0;
    
    // Count upcoming appointments from the appointments collection
    let upcomingAppointments = 0;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const query = user.role === 'doctor' 
        ? { doctorId: user._id, date: { $gte: today }, status: 'scheduled' }
        : { patientId: user._id, date: { $gte: today }, status: 'scheduled' };
        
      upcomingAppointments = await Appointment.countDocuments(query);
    } catch (error) {
      console.error('Error counting appointments:', error);
      // Fallback to mock data if there's an error
      upcomingAppointments = 2;
    }
    
    // Count conditions that are ongoing
    const ongoingConditions = medicalRecord ? 
      medicalRecord.conditions.filter((condition: { status: string }) => condition.status === 'ongoing').length : 0;
    
    // Calculate health score (simplified algorithm)
    const calculateHealthScore = () => {
      if (!medicalRecord) return 70; // Default value
      
      let score = 80; // Starting score
      
      // Adjust for conditions
      score -= ongoingConditions * 5;
      
      // Adjust for medications
      score -= activeMedications * 2;
      
      // Adjust for lifestyle factors
      if (medicalRecord.lifestyle) {
        if (medicalRecord.lifestyle.smokingStatus === 'current') score -= 10;
        if (medicalRecord.lifestyle.alcoholConsumption === 'heavy') score -= 10;
        if (medicalRecord.lifestyle.exerciseFrequency === 'daily') score += 10;
        if (medicalRecord.lifestyle.exerciseFrequency === 'weekly') score += 5;
      }
      
      // Ensure score stays within 0-100 range
      return Math.max(0, Math.min(100, score));
    };
    
    // Count how many health recommendations the user has saved
    const savedRecommendations = aiConversations.reduce((count, conversation) => {
      return count + (conversation.healthRecommendations?.filter((rec: { saved: boolean }) => rec.saved)?.length || 0);
    }, 0);
    
    // Get the count of document analyses
    const documentAnalysesCount = aiConversations.reduce((count, conversation) => {
      return count + (conversation.documentAnalyses?.length || 0);
    }, 0);
    
    // Get the count of health education progress
    const educationModules = aiConversations.reduce((count, conversation) => {
      return count + (conversation.healthEducation?.length || 0);
    }, 0);
    
    const completedEducationModules = aiConversations.reduce((count, conversation) => {
      return count + (conversation.healthEducation?.filter((edu: { interactionData?: { completionStatus: string } }) => 
        edu.interactionData?.completionStatus === 'completed'
      )?.length || 0);
    }, 0);
    
    // Get the count of symptom checks performed
    const symptomChecksCount = aiConversations.reduce((count, conversation) => {
      return count + (conversation.symptomChecks?.length || 0);
    }, 0);
    
    // Count lab tests from the past year
    const pastYearLabTests = medicalRecord ? 
      medicalRecord.labTests.filter((test: { date: string | Date }) => {
        const testDate = new Date(test.date);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return testDate >= oneYearAgo;
      }).length : 0;
    
    // Calculate medication adherence (mock data for now)
    const medicationAdherence = 92; // This would be calculated from real medication tracking data
    
    // Calculate streak for logging in or checking health data (mock data for now)
    const streak = 15; // This would be fetched from a user activity log

    return NextResponse.json({
      success: true,
      stats: {
        bmi: calculateBMI() || "24.3", // Fallback to mock data if real data isn't available
        activeMedications,
        upcomingAppointments,
        ongoingConditions,
        connectedDoctors,
        healthScore: calculateHealthScore(),
        savedRecommendations,
        documentAnalysesCount,
        educationProgress: completedEducationModules + '/' + educationModules,
        symptomChecksCount,
        pastYearLabTests,
        medicationAdherence,
        streak
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 