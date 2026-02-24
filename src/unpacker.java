/*
    File Unpacker Utility
    Uses magic number to validate pack file
    Supports command line arguments
    Author: Sanket Sadashiv Hajare
*/

import java.util.*;
import java.io.*;

class unpacker
{
    public static void main(String A[]) throws Exception
    {
        byte key = 0x11;
        byte Buffer[] =  null;
        byte bHeader[] = new byte[100];

        int FileSize = 0;
        int i = 0;

        String FileName = null;
        String Header = null;
        String magicstr = null;
        String Tokens[] = null;

        File fpackobj = null;
        File fobj = null;

        FileInputStream fiobj = null;
        FileOutputStream foobj = null;



        if(A.length != 1)
        {
            System.out.println("Error : Invalid input");
            System.out.println("Usage : java unpacker <PackFileName>");
            return;
        }

        FileName = A[0];

        fpackobj = new File(FileName);

        if(fpackobj.exists() == false)
        {
            System.out.println("Error : Packed File does not exists");
            return;
        }

        fiobj = new FileInputStream(fpackobj);

        final String MAGIC = "SRH3";
        byte magic[] = new byte[4];

        fiobj.read(magic,0,4);

        magicstr = new String(magic);

        if(!MAGIC.equals(magicstr))
        {
            System.out.println("Error : Invalid pack file format.");
            fiobj.close();
            return;
        }

        System.out.println("Valid packfile detected");

        while(fiobj.read(bHeader,0,100) == 100)
        {
            Header = new String(bHeader).trim();

            Tokens = Header.split(" ");

            if(Tokens.length < 2)
            {
                break;
            }

            System.out.println("Extracting file : "+Tokens[0]);

            fobj = new File(Tokens[0]);

            foobj = new FileOutputStream(fobj);

            FileSize = Integer.parseInt(Tokens[1]);

            Buffer = new byte[FileSize];

            fiobj.read(Buffer,0,FileSize);

            for(i = 0; i < FileSize; i++)
            {
                Buffer[i] = (byte)(Buffer[i] ^ key);
            }

            foobj.write(Buffer,0,FileSize);

            foobj.close();
        }

        fiobj.close();

        System.out.println("Unpacking completed succesfully.");
    }
}