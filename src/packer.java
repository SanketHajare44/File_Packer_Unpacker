/*
    File Packer Utility
    Uses custom archive format with magic number authentication
    Supports command line arguments
    Author: Sanket Sadashiv Hajare
*/

import java.util.*;
import java.io.*;

class packer
{
    public static void main(String A[]) throws Exception
    {
        String Header = null;

        final String MAGIC = "SRH3";
        byte magic[] = MAGIC.getBytes();

        byte key = 0x11;

        int iRet = 0;
        int i = 0;
        int j = 0;

        byte Buffer[] = new byte[1024];

        byte bHeader[] = new byte[100];

        if(A.length != 2)
        {
            System.out.println("Error : Invalid Input");
            System.out.println("Usage : java packer <FolderName> <PackFileName>");
            return;
        }

        String FolderName = A[0];
        String PackName = A[1];

        File fobj = new File(FolderName);

        if((fobj.exists()) && (fobj.isDirectory()))
        {
            File packobj = new File(PackName);

            packobj.createNewFile();
        
            FileOutputStream foobj = new FileOutputStream(packobj);

            foobj.write(magic,0,magic.length);

            FileInputStream fiobj = null;

            System.out.println("Folder is present");

            File fArr[] = fobj.listFiles();

            System.out.println("Number of files in the folder are : "+fArr.length);

            for(i = 0; i < fArr.length; i++)
            {
                if(fArr[i].isFile())
                {
                    fiobj = new FileInputStream(fArr[i]);

                    Header = fArr[i].getName()+" "+fArr[i].length();

                    StringBuilder sb = new StringBuilder(Header);

                    while(sb.length() < 100)
                    {
                        sb.append(" ");
                    }

                    Header = sb.toString();

                    bHeader = Header.getBytes();

                    foobj.write(bHeader,0,100);

                    while((iRet = fiobj.read(Buffer)) != -1)
                    {
                        for(j = 0; j < iRet; j++)
                        {
                            Buffer[j] = (byte) (Buffer[j] ^ key);
                        }

                        foobj.write(Buffer, 0, iRet);
                    }

                    fiobj.close();

                    System.out.println("Packed file : "+ fArr[i].getName());
                }
            }

            foobj.close();

            System.out.println("Packing completed succesfully.");
 
        }
        else
        {
            System.out.println("Error : Folder does not exist.");
        }
        
    }
}