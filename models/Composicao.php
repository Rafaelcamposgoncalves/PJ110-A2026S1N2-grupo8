<?php

class Composicao {

    private $conn;
    private $table = "composicao";

    public function __construct($db) {
        $this->conn = $db;
    }

    /* =========================
       LISTAR
    ========================= */
    public function listar() {

        $sql = "
            SELECT id_composicao, descricao 
            FROM {$this->table}
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /* =========================
       BUSCAR
    ========================= */
    public function buscar($id) {

        $sql = "
            SELECT id_composicao, descricao 
            FROM {$this->table}
            WHERE id_composicao = :id
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
	
	/* =========================
	   BUSCAR POR TODOS OS CAMPOS (LIKE)
	   ========================= */
	public function buscarPorCampos($termo) {

		$termo = "%{$termo}%"; // para usar no LIKE

		$sql = "
			SELECT id_composicao, descricao
			FROM {$this->table}
			WHERE descricao LIKE :termo
		";

		$stmt = $this->conn->prepare($sql);
		$stmt->bindParam(':termo', $termo, PDO::PARAM_STR);
		$stmt->execute();

		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}	

    /* =========================
       CRIAR
    ========================= */
    public function criar($descricao) {

        $sql = "
            INSERT INTO {$this->table} (descricao)
            VALUES (:descricao)
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':descricao', $descricao);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /* =========================
       ATUALIZAR
    ========================= */
    public function atualizar($id, $descricao) {

        $sql = "
            UPDATE {$this->table}
            SET descricao = :descricao
            WHERE id_composicao = :id
        ";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(':descricao', $descricao);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
}

    /* =========================
       DELETAR
    ========================= */
public function deletar($id) {
    // O SQL deve ser simples
    $sql = "DELETE FROM {$this->table} WHERE id_composicao = :id";
    $stmt = $this->conn->prepare($sql);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    
    // 🔥 IMPORTANTE: O execute() lançará a PDOException que o Controller vai pegar
    return $stmt->execute(); 
}

}