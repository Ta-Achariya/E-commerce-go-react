package database

import (
	"fmt"
	"log"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
)

var AzureClient *azblob.Client

func GetServiceClientTokenCredential(accountURL string) {
	// Create a new service client with token credential
	credential, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("Invalid credentials: %v", err)
	}

	AzureClient, err = azblob.NewClient(accountURL, credential, nil)
	if err != nil {
		log.Fatalf("Failed to create Azure client: %v", err)
	}

	fmt.Println("Connect to azure storage successfully")

}
