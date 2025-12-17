import React from 'react';

export const EngineeringPlan: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-gray-800 p-4 shadow-md z-10 flex items-center border-b border-gray-700">
        <button onClick={onBack} className="mr-4 text-gray-400 hover:text-white">
          ← Back
        </button>
        <h2 className="text-lg font-bold text-white">Engineering Architecture</h2>
      </div>
      
      <div className="p-6 max-w-3xl mx-auto space-y-8 pb-20">
        <section>
          <h3 className="text-xl font-bold text-green-400 mb-2">1. Core Constraints</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
            <li>Small scale (1-20 users)</li>
            <li>Reliability > Features</li>
            <li>Signal Protocol E2EE (Mandatory)</li>
            <li>React Native (Android First) - <i>(This web app is the architecture prototype)</i></li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-blue-400 mb-2">2. System Architecture</h3>
          <div className="bg-gray-800 p-4 rounded-md font-mono text-xs overflow-x-auto border border-gray-700">
            <pre>{`
[Mobile Client] <--- WebSocket ---> [Node.js Server] <--- [Redis Queue]
      |                                     |
[SQLite Local DB]                    [PostgreSQL DB]
(Messages/Keys)                      (Users/PreKeys/Undelivered)
            `}</pre>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-blue-400 mb-2">3. Database Schema (PostgreSQL)</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-mono text-yellow-500 text-sm">users</h4>
              <p className="text-xs text-gray-400">id (UUID), phone_number, identity_key, registration_id</p>
            </div>
            <div>
              <h4 className="font-mono text-yellow-500 text-sm">pre_keys</h4>
              <p className="text-xs text-gray-400">user_id, key_id, public_key, signature</p>
            </div>
            <div>
              <h4 className="font-mono text-yellow-500 text-sm">pending_messages</h4>
              <p className="text-xs text-gray-400">id, recipient_id, content_encrypted, iv</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-purple-400 mb-2">4. Encryption Flow</h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-300">
            <li><strong className="text-white">Session Check:</strong> Client checks `libsignal` session store.</li>
            <li><strong className="text-white">Key Fetch:</strong> If no session, fetch PreKey bundle from API.</li>
            <li><strong className="text-white">Encrypt:</strong> `Signal.encrypt(msg)` locally on device.</li>
            <li><strong className="text-white">Transport:</strong> Send ciphertext via WebSocket.</li>
            <li><strong className="text-white">Decrypt:</strong> Recipient decrypts and stores in local SQLite.</li>
          </ol>
        </section>

         <section>
          <h3 className="text-xl font-bold text-red-400 mb-2">5. Failure Points & Mitigation</h3>
           <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
            <li>
                <strong className="text-white">Key Exhaustion:</strong> User runs out of one-time keys.
                <br/><span className="text-gray-500">Fix: Server counts keys, forces client to upload more on next connect.</span>
            </li>
            <li>
                <strong className="text-white">Clock Skew:</strong> Message timestamp issues.
                <br/><span className="text-gray-500">Fix: Use server timestamps for ordering, client timestamps for display only.</span>
            </li>
            <li>
                <strong className="text-white">Race Conditions:</strong> Double ratchet out of sync.
                <br/><span className="text-gray-500">Fix: Implement strict message ordering queue on client.</span>
            </li>
           </ul>
        </section>
      </div>
    </div>
  );
};
