package utils

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"fmt"
)

func KeypairGenerate(seed string) (privateKey, publicKey string, err error) {
	privateKeyBytes, publicKeyBytes, err := generateRSAKeyPair(seed)
	if err != nil {
		return "", "", err
	}

	privateKey = base64.StdEncoding.EncodeToString(privateKeyBytes)
	publicKey = base64.StdEncoding.EncodeToString(publicKeyBytes)

	return privateKey, publicKey, nil
}

func generateRSAKeyPair(seed string) ([]byte, []byte, error) {
	privateKey, publicKey, err := generateKeyPairFromSeed(seed)
	if err != nil {
		return nil, nil, err
	}

	privateKeyBytes := privateKeyToBytes(privateKey)
	publicKeyBytes := publicKeyToBytes(publicKey)

	return privateKeyBytes, publicKeyBytes, nil
}

func generateKeyPairFromSeed(seed string) (*rsa.PrivateKey, *rsa.PublicKey, error) {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to generate RSA key pair: %w", err)
	}

	publicKey := &privateKey.PublicKey

	return privateKey, publicKey, nil
}
func privateKeyToBytes(privateKey *rsa.PrivateKey) []byte {
	privateKeyBytes := x509.MarshalPKCS1PrivateKey(privateKey)
	if privateKeyBytes == nil {
		return nil
	}
	return privateKeyBytes
}
func publicKeyToBytes(publicKey *rsa.PublicKey) []byte {
	publicKeyBytes, err := x509.MarshalPKIXPublicKey(publicKey)
	if err != nil {
		return nil
	}
	return publicKeyBytes
}
