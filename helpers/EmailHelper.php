<?php
// helpers/EmailHelper.php

// Inclusão manual dos arquivos do PHPMailer na sua pasta lib
require_once __DIR__ . '/../lib/PHPMailer/src/Exception.php';
require_once __DIR__ . '/../lib/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../lib/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailHelper {
    /**
     * Envia um e-mail de recuperação de senha utilizando o Mailtrap Sandbox.
     * 
     * @param string $emailDestino E-mail do usuário da oficina
     * @param string $token Token único gerado para a redefinição
     * @return bool Retorna true em caso de sucesso ou false se houver falha
     */
    public static function enviarRecuperacaoSenha($emailDestino, $token) {
        $mail = new PHPMailer(true);

        try {
            // ==========================================
            // CONFIGURAÇÃO DO SERVIDOR MAILTRAP (CORRIGIDO)
            // ==========================================
            $mail->isSMTP();
            $mail->Host       = 'sandbox.smtp.mailtrap.io'; 
            $mail->SMTPAuth   = true;
            $mail->Username   = '169ae95d32f063'; 
            $mail->Password   = '6405f5df322712'; 
            $mail->SMTPSecure = 'tls'; // Alterado de ENCRYPT_STARTTLS para 'tls' direto
            $mail->Port       = 2525; 


            // ==========================================
            // REMETENTE E DESTINATÁRIO
            // ==========================================
            $mail->setFrom('sistema@oficinalaminacao.com.br', 'Oficina de Laminação');
            $mail->addAddress($emailDestino);

            // ==========================================
            // CONTEÚDO DO E-MAIL
            // ==========================================
            $mail->isHTML(true); 
            $mail->CharSet = 'UTF-8';
            $mail->Subject = 'Recuperação de Acesso - Oficina de Laminação';
            
            // Link que aponta para o projeto local executado na mão
            $linkRedefinicao = "http://localhost/teste/criasenha.php?token=" . $token;


            $mail->Body = "
                <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                    <h2>Recuperação de Acesso</h2>
                    <p>Olá,</p>
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta no sistema da oficina de laminação.</p>
                    <p>Para prosseguir, clique no botão abaixo:</p>
                    <p style='margin: 30px 0;'>
                        <a href='{$linkRedefinicao}' style='background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Redefinir Minha Senha</a>
                    </p>
                    <p style='font-size: 12px; color: #777;'>Se você não solicitou essa alteração, ignore este e-mail.</p>
                </div>
            ";

            $mail->send();
            return true;
            
        } catch (Exception $e) {
            // Caso falhe, podemos rastrear o erro interno do PHPMailer
            error_log("Erro PHPMailer: " . $mail->ErrorInfo);
            return false;
        }
    }
}
