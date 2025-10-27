'use client';

const scenarios = [
  {
    icon: '📅',
    question: 'Schedule an appointment for my child',
    response: 'I can help you schedule a free consultation! We have availability Monday through Friday...',
  },
  {
    icon: '💰',
    question: 'How much do braces cost?',
    response: 'Traditional braces typically range from $3,000 to $7,000. Most insurance covers 50-85%...',
  },
  {
    icon: '🏥',
    question: 'Do you accept Delta Dental insurance?',
    response: 'Yes! We accept Delta Dental and most major insurance providers. Let me verify your benefits...',
  },
  {
    icon: '⏱️',
    question: "What's the treatment timeline for Invisalign?",
    response: 'Invisalign treatment typically takes 12-18 months for most cases. During your consultation...',
  },
  {
    icon: '🚨',
    question: 'I have a broken bracket, what should I do?',
    response: 'I understand this is uncomfortable. We can schedule an emergency repair within 1-2 days...',
  },
  {
    icon: '👨',
    question: 'Can adults get braces?',
    response: 'Absolutely! We treat patients of all ages. Adult orthodontics is very common...',
  },
  {
    icon: '🕐',
    question: 'What are your office hours?',
    response: "We're open Monday through Friday 8am-6pm, and Saturday mornings 9am-2pm...",
  },
  {
    icon: '💳',
    question: 'Can I pay with a payment plan?',
    response: 'Yes! We offer flexible payment plans with 0% financing and accept CareCredit...',
  },
];

export default function DemoScenarios() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Try These Questions
          </h2>
          <p className="text-lg text-gray-600">
            Call our demo number and ask Pronto anything about orthodontic treatment
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {scenarios.map((scenario, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-3">{scenario.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                &ldquo;{scenario.question}&rdquo;
              </h3>
              <p className="text-sm text-gray-600 italic">
                {scenario.response}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
