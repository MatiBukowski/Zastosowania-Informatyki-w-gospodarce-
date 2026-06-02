import React from 'react';
import { useRouter } from 'expo-router';

import LoginModal from '@/ui/components/modals/LoginModal';

const LoginScreen = () => {
    const router = useRouter();

    return (
        <LoginModal
            visible
            onClose={() => router.back()}
        />
    );
};

export default LoginScreen;
